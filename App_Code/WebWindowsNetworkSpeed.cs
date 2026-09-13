using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Web;

public sealed class WebWindowsNetworkSpeed : IHttpHandler
{
    private const int MaxDownloadBytes = 4 * 1024 * 1024;
    private const int MaxUploadBytes = 2 * 1024 * 1024;
    private const int MaxRequestsPerMinute = 40;
    private const long MaxBytesPerClientMinute = 32L * 1024 * 1024;
    private const long MaxBytesGlobalMinute = 512L * 1024 * 1024;
    private const int MaxConcurrentTransfers = 12;

    private sealed class Usage
    {
        public DateTime WindowStartedUtc;
        public int Requests;
        public long Bytes;
    }

    private static readonly object RateLock = new object();
    private static readonly Dictionary<string, Usage> ClientUsage = new Dictionary<string, Usage>(StringComparer.Ordinal);
    private static readonly byte[] ClientHashSalt = CreateSalt();
    private static DateTime GlobalWindowStartedUtc = DateTime.UtcNow;
    private static long GlobalBytes;
    private static int ActiveTransfers;

    public bool IsReusable { get { return true; } }

    public void ProcessRequest(HttpContext context)
    {
        SetPrivacyAndCacheHeaders(context.Response);
        if (!String.Equals(context.Request.Headers["X-WebWindows-Speed-Test"], "1", StringComparison.Ordinal) ||
            String.Equals(context.Request.Headers["Sec-Fetch-Site"], "cross-site", StringComparison.OrdinalIgnoreCase))
        {
            WriteError(context, 403, "SAME_ORIGIN_REQUIRED");
            return;
        }

        string action = (context.Request.QueryString["action"] ?? String.Empty).Trim().ToLowerInvariant();
        if (action == "ping")
        {
            if (!String.Equals(context.Request.HttpMethod, "GET", StringComparison.OrdinalIgnoreCase))
            {
                WriteError(context, 405, "METHOD_NOT_ALLOWED");
                return;
            }
            if (!TryConsume(context, 0)) return;
            context.Response.ContentType = "application/octet-stream";
            context.Response.StatusCode = 204;
            return;
        }

        int size;
        if (!Int32.TryParse(context.Request.QueryString["size"], out size) || size <= 0)
        {
            WriteError(context, 400, "INVALID_SIZE");
            return;
        }

        bool download = action == "download";
        bool upload = action == "upload";
        if (!download && !upload)
        {
            WriteError(context, 400, "INVALID_ACTION");
            return;
        }
        if ((download && (!String.Equals(context.Request.HttpMethod, "GET", StringComparison.OrdinalIgnoreCase) || size > MaxDownloadBytes)) ||
            (upload && (!String.Equals(context.Request.HttpMethod, "POST", StringComparison.OrdinalIgnoreCase) || size > MaxUploadBytes)))
        {
            WriteError(context, size > (download ? MaxDownloadBytes : MaxUploadBytes) ? 413 : 405,
                size > (download ? MaxDownloadBytes : MaxUploadBytes) ? "PAYLOAD_TOO_LARGE" : "METHOD_NOT_ALLOWED");
            return;
        }
        if (upload && (context.Request.ContentLength != size ||
            !String.Equals(context.Request.ContentType, "application/octet-stream", StringComparison.OrdinalIgnoreCase)))
        {
            WriteError(context, 400, "UPLOAD_LENGTH_OR_TYPE_MISMATCH");
            return;
        }
        if (!TryConsume(context, size)) return;
        if (Interlocked.Increment(ref ActiveTransfers) > MaxConcurrentTransfers)
        {
            Interlocked.Decrement(ref ActiveTransfers);
            context.Response.AddHeader("Retry-After", "5");
            WriteError(context, 429, "TOO_MANY_CONCURRENT_TRANSFERS");
            return;
        }

        try
        {
            if (download) WriteDownload(context, size);
            else DiscardUpload(context, size);
        }
        finally
        {
            Interlocked.Decrement(ref ActiveTransfers);
        }
    }

    private static void WriteDownload(HttpContext context, int size)
    {
        context.Response.ContentType = "application/octet-stream";
        context.Response.BufferOutput = false;
        context.Response.AddHeader("Content-Length", size.ToString());
        byte[] buffer = new byte[Math.Min(32 * 1024, size)];
        using (RandomNumberGenerator random = RandomNumberGenerator.Create())
        {
            int remaining = size;
            while (remaining > 0 && context.Response.IsClientConnected)
            {
                int count = Math.Min(buffer.Length, remaining);
                random.GetBytes(buffer);
                context.Response.OutputStream.Write(buffer, 0, count);
                context.Response.Flush();
                remaining -= count;
            }
        }
    }

    private static void DiscardUpload(HttpContext context, int expectedBytes)
    {
        byte[] buffer = new byte[32 * 1024];
        int received = 0;
        Stream input = context.Request.InputStream;
        while (received < expectedBytes)
        {
            int count = input.Read(buffer, 0, Math.Min(buffer.Length, expectedBytes - received));
            if (count <= 0) break;
            received += count;
        }
        Array.Clear(buffer, 0, buffer.Length);
        if (received != expectedBytes)
        {
            WriteError(context, 400, "INCOMPLETE_UPLOAD");
            return;
        }
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = 200;
        context.Response.Write("{\"ok\":true,\"receivedBytes\":" + received + ",\"stored\":false}");
    }

    private static bool TryConsume(HttpContext context, int bytes)
    {
        DateTime now = DateTime.UtcNow;
        string key = HashClient(context.Request.UserHostAddress ?? "unknown");
        lock (RateLock)
        {
            if ((now - GlobalWindowStartedUtc).TotalSeconds >= 60)
            {
                GlobalWindowStartedUtc = now;
                GlobalBytes = 0;
            }
            Usage usage;
            if (!ClientUsage.TryGetValue(key, out usage) || (now - usage.WindowStartedUtc).TotalSeconds >= 60)
            {
                usage = new Usage { WindowStartedUtc = now };
                ClientUsage[key] = usage;
            }
            if (usage.Requests >= MaxRequestsPerMinute || usage.Bytes + bytes > MaxBytesPerClientMinute || GlobalBytes + bytes > MaxBytesGlobalMinute)
            {
                context.Response.AddHeader("Retry-After", "60");
                WriteError(context, 429, "RATE_LIMITED");
                return false;
            }
            usage.Requests += 1;
            usage.Bytes += bytes;
            GlobalBytes += bytes;
            if (ClientUsage.Count > 2048) RemoveExpiredClients(now);
            return true;
        }
    }

    private static void RemoveExpiredClients(DateTime now)
    {
        var expired = new List<string>();
        foreach (KeyValuePair<string, Usage> item in ClientUsage)
            if ((now - item.Value.WindowStartedUtc).TotalMinutes >= 2) expired.Add(item.Key);
        foreach (string key in expired) ClientUsage.Remove(key);
    }

    private static string HashClient(string address)
    {
        using (SHA256 sha = SHA256.Create())
        {
            byte[] addressBytes = Encoding.UTF8.GetBytes(address);
            byte[] input = new byte[ClientHashSalt.Length + addressBytes.Length];
            Buffer.BlockCopy(ClientHashSalt, 0, input, 0, ClientHashSalt.Length);
            Buffer.BlockCopy(addressBytes, 0, input, ClientHashSalt.Length, addressBytes.Length);
            return Convert.ToBase64String(sha.ComputeHash(input));
        }
    }

    private static byte[] CreateSalt()
    {
        byte[] value = new byte[32];
        using (RandomNumberGenerator random = RandomNumberGenerator.Create()) random.GetBytes(value);
        return value;
    }

    private static void SetPrivacyAndCacheHeaders(HttpResponse response)
    {
        response.TrySkipIisCustomErrors = true;
        response.Cache.SetCacheability(HttpCacheability.NoCache);
        response.Cache.SetNoStore();
        response.Cache.SetExpires(DateTime.UtcNow.AddYears(-1));
        response.AddHeader("Pragma", "no-cache");
        response.AddHeader("X-Content-Type-Options", "nosniff");
        response.AddHeader("Referrer-Policy", "no-referrer");
        response.AddHeader("X-WebWindows-Speed-Scope", "service-node-link");
        response.AddHeader("X-WebWindows-Speed-Limits", "download=4194304; upload=2097152; client-minute=33554432");
    }

    private static void WriteError(HttpContext context, int status, string code)
    {
        context.Response.StatusCode = status;
        context.Response.ContentType = "application/json";
        context.Response.Write("{\"ok\":false,\"error\":{\"code\":\"" + code + "\"}}");
    }
}
