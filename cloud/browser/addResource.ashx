<%@ WebHandler Language="C#" Class="WebWindowsCloudAddResource" %>

using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Web;

public sealed class WebWindowsCloudAddResource : IHttpHandler
{
    private const int MaxFileBytes = 10 * 1024 * 1024;

    private static readonly HashSet<string> AllowedExtensions =
        new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            ".jpg", ".jpeg", ".png", ".gif", ".webp",
            ".pdf", ".txt", ".log", ".md", ".json", ".csv",
            ".xls", ".xlsx", ".doc", ".docx", ".ppt", ".pptx", ".zip"
        };

    public bool IsReusable { get { return false; } }

    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "application/json";
        context.Response.ContentEncoding = Encoding.UTF8;

        if (!String.Equals(context.Request.HttpMethod, "POST", StringComparison.OrdinalIgnoreCase))
        {
            WriteError(context, 405, "METHOD_NOT_ALLOWED", "\u53ea\u5141\u8bb8 POST \u8bf7\u6c42");
            return;
        }

        string configuredKey = Convert.ToString(context.Application["WebWindowsCloudAdminKey"]);
        if (String.IsNullOrWhiteSpace(configuredKey))
        {
            configuredKey = Environment.GetEnvironmentVariable("WEBWINDOWS_CLOUD_ADMIN_KEY");
        }
        string presentedKey = context.Request.Headers["X-WebWindows-Admin-Key"];
        if (String.IsNullOrWhiteSpace(configuredKey) ||
            !String.Equals(configuredKey, presentedKey, StringComparison.Ordinal))
        {
            WriteError(context, 401, "ADMIN_REQUIRED", "\u9700\u8981\u4e91\u8d44\u6e90\u8282\u70b9\u7ba1\u7406\u6743\u9650");
            return;
        }

        HttpPostedFile file = context.Request.Files["resource"];
        if (file == null || file.ContentLength <= 0)
        {
            WriteError(context, 400, "RESOURCE_REQUIRED", "\u8bf7\u9009\u62e9\u8981\u52a0\u5165\u7684\u8d44\u6599");
            return;
        }
        if (file.ContentLength > MaxFileBytes)
        {
            WriteError(context, 413, "RESOURCE_TOO_LARGE", "\u5355\u9879\u8d44\u6599\u4e0d\u80fd\u8d85\u8fc7 10 MB");
            return;
        }

        string fileName = Path.GetFileName(file.FileName ?? String.Empty).Trim();
        string extension = Path.GetExtension(fileName);
        if (String.IsNullOrWhiteSpace(fileName) ||
            fileName == "." || fileName == ".." ||
            fileName.IndexOfAny(Path.GetInvalidFileNameChars()) >= 0)
        {
            WriteError(context, 400, "INVALID_NAME", "\u8d44\u6599\u540d\u79f0\u65e0\u6548");
            return;
        }
        if (!AllowedExtensions.Contains(extension))
        {
            WriteError(context, 415, "UNSUPPORTED_TYPE", "\u6b64\u7c7b\u8d44\u6599\u6682\u4e0d\u5141\u8bb8\u52a0\u5165\u516c\u5171\u8d44\u6599\u5e93");
            return;
        }

        string relativePath;
        if (!TryNormalizePath(context.Request.Form["path"], out relativePath))
        {
            WriteError(context, 400, "INVALID_PATH", "\u8d44\u6599\u4f4d\u7f6e\u65e0\u6548");
            return;
        }

        string canonicalRoot = Path.GetFullPath(context.Server.MapPath("../file/Public"));
        string legacyRoot = Path.GetFullPath(context.Server.MapPath("../file/\u516c\u5171\u533a\u57df"));
        if (!Directory.Exists(canonicalRoot) && Directory.Exists(legacyRoot))
        {
            WriteError(context, 409, "LEGACY_PUBLIC_ROOT_READ_ONLY",
                "\u65e7\u7248\u516c\u5171\u533a\u57df\u4ec5\u517c\u5bb9\u8bfb\u53d6\uff0c\u8bf7\u5148\u8fc1\u79fb\u5230 Public");
            return;
        }
        string publicRoot = canonicalRoot;
        string targetDirectory = relativePath.Length == 0
            ? publicRoot
            : Path.GetFullPath(Path.Combine(publicRoot, relativePath.Replace('/', Path.DirectorySeparatorChar)));
        string rootPrefix = publicRoot.TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;
        if (!targetDirectory.Equals(publicRoot, StringComparison.OrdinalIgnoreCase) &&
            !targetDirectory.StartsWith(rootPrefix, StringComparison.OrdinalIgnoreCase))
        {
            WriteError(context, 400, "INVALID_PATH", "\u8d44\u6599\u4f4d\u7f6e\u65e0\u6548");
            return;
        }
        if (!Directory.Exists(targetDirectory))
        {
            WriteError(context, 404, "PARENT_NOT_FOUND", "\u76ee\u6807\u8d44\u6599\u5939\u4e0d\u5b58\u5728");
            return;
        }

        string destination = Path.Combine(targetDirectory, fileName);
        if (File.Exists(destination) || Directory.Exists(destination))
        {
            WriteError(context, 409, "NAME_CONFLICT", "\u5df2\u5b58\u5728\u540c\u540d\u8d44\u6599");
            return;
        }

        try
        {
            file.SaveAs(destination);
            string resourcePath = relativePath.Length == 0 ? fileName : relativePath + "/" + fileName;
            context.Response.StatusCode = 201;
            context.Response.Write("{\"ok\":true,\"item\":{\"name\":\"" +
                Json(fileName) + "\",\"path\":\"" + Json(resourcePath) +
                "\",\"kind\":\"file\",\"size\":" + file.ContentLength + "}}");
        }
        catch
        {
            WriteError(context, 500, "WRITE_FAILED", "\u52a0\u5165\u8d44\u6599\u5931\u8d25");
        }
    }

    private static bool TryNormalizePath(string value, out string normalized)
    {
        normalized = String.Empty;
        string raw = (value ?? String.Empty).Trim().Replace('\\', '/');
        if (raw.StartsWith("/", StringComparison.Ordinal) || raw.IndexOf('\0') >= 0) return false;

        var safe = new List<string>();
        foreach (string rawSegment in raw.Split(new[] { '/' }, StringSplitOptions.RemoveEmptyEntries))
        {
            string segment = rawSegment.Trim();
            if (segment.Length == 0 || segment == "." || segment == ".." ||
                segment.IndexOfAny(Path.GetInvalidFileNameChars()) >= 0)
            {
                return false;
            }
            safe.Add(segment);
        }
        normalized = String.Join("/", safe.ToArray());
        return true;
    }

    private static string Json(string value)
    {
        return (value ?? String.Empty)
            .Replace("\\", "\\\\")
            .Replace("\"", "\\\"")
            .Replace("\r", "\\r")
            .Replace("\n", "\\n");
    }

    private static void WriteError(HttpContext context, int status, string code, string message)
    {
        context.Response.StatusCode = status;
        context.Response.TrySkipIisCustomErrors = true;
        context.Response.Write("{\"ok\":false,\"error\":{\"code\":\"" +
            Json(code) + "\",\"message\":\"" + Json(message) + "\"}}");
    }
}
