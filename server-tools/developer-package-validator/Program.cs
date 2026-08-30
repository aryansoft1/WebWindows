using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Web.Script.Serialization;

namespace WebWindows.DeveloperPackageValidator {
  internal static class Program {
    const string ValidatorVersion = "1.0.0";
    static readonly UTF8Encoding StrictUtf8 = new UTF8Encoding(false, true);
    static readonly JavaScriptSerializer Json = new JavaScriptSerializer { MaxJsonLength = 4 * 1024 * 1024, RecursionLimit = 100 };

    static int Main(string[] args) {
      if (args.Length != 8) return 64;
      try {
        var result = Validator.Validate(args[0], args[1], args[2], args[3], args[4], args[6], args[7]);
        File.WriteAllText(args[5], Json.Serialize(result), new UTF8Encoding(false));
        return result.passed ? 0 : 2;
      } catch (Exception ex) {
        var report = Validator.Fatal(args[0], args[4], args[7], "WWT007", "Malformed or unreadable ZIP archive.", ex.GetType().Name);
        File.WriteAllText(args[5], Json.Serialize(report), new UTF8Encoding(false));
        return 2;
      }
    }

    internal sealed class Diagnostic {
      public string ruleId, severity, path, message;
      public IDictionary<string, object> metadata;
    }
    internal sealed class Result {
      public string contract = "webwindows-server-validation-report-v1";
      public string reportId, validatorVersion = ValidatorVersion, validatedAt, packageSha256, sourceManifestSha256;
      public long packageSize;
      public int? manifestVersion;
      public string appId, version, publisherId, sdkVersion, submissionId;
      public IDictionary<string, object> normalizedAppIdentity;
      public string schemaResult, packagePolicyResult;
      public string[] requestedPermissions = new string[0];
      public Diagnostic[] diagnostics;
      public bool passed;
    }

    internal static class Validator {
      static readonly Regex SafeId = new Regex("^[a-z0-9]+([._-][a-z0-9]+)+$", RegexOptions.CultureInvariant);
      static readonly Regex SafeVersion = new Regex("^[0-9]+(\\.[0-9]+){1,3}([._-][a-z0-9]+)?$", RegexOptions.CultureInvariant);

      public static Result Validate(string zipPath, string outerPath, string expectedId, string expectedVersion,
          string publisherId, string contractsRoot, string submissionId) {
        var diagnostics = new List<Diagnostic>();
        var packageBytes = File.ReadAllBytes(zipPath);
        var packageHash = Sha(packageBytes);
        var policy = Obj(ParseFile(Path.Combine(contractsRoot, "data", "sdk", "package-runtime-policy-v1.json")));
        var permissions = Obj(ParseFile(Path.Combine(contractsRoot, "data", "sdk", "permissions-v1.json")));
        var schema1 = Obj(ParseFile(Path.Combine(contractsRoot, "data", "sdk", "manifest-v1.schema.json")));
        var schema2 = Obj(ParseFile(Path.Combine(contractsRoot, "data", "sdk", "manifest-v2.schema.json")));
        var limits = Obj(policy["limits"]);
        var maxFiles = Convert.ToInt32(limits["maxFiles"], CultureInfo.InvariantCulture);
        var maxBytes = Convert.ToInt64(limits["maxUnpackedBytes"], CultureInfo.InvariantCulture);
        var maxPath = Convert.ToInt32(limits["maxPathCharacters"], CultureInfo.InvariantCulture);
        var allowedExtensions = new HashSet<string>(Arr(policy["allowedExtensions"]).Select(Convert.ToString), StringComparer.OrdinalIgnoreCase);
        var records = ZipPreflight.Read(packageBytes, diagnostics);
        var files = new Dictionary<string, byte[]>(StringComparer.Ordinal);
        var casePaths = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        long unpacked = 0;

        if (records.Count(r => !r.IsDirectory) > maxFiles) Error(diagnostics, "WWP003", "$package", "Package file count exceeds the frozen limit.");
        foreach (var record in records) {
          if (record.IsDirectory) continue;
          var path = NormalizePath(record.Name, maxPath, diagnostics);
          if (path == null) continue;
          if (!String.Equals(path, "manifest.json", StringComparison.Ordinal)
              && String.Equals(Path.GetFileName(path), "manifest.json", StringComparison.OrdinalIgnoreCase))
            Error(diagnostics, "WWP001", path, "Additional or non-root Manifest candidate is forbidden.");
          if (!casePaths.Add(path)) { Error(diagnostics, "WWT005", path, "Duplicate or case-colliding ZIP path."); continue; }
          if (record.IsSpecial) { Error(diagnostics, "WWP002", path, "Symlink or special ZIP entry is forbidden."); continue; }
          var ext = Path.GetExtension(path);
          if (!allowedExtensions.Contains(ext)) Error(diagnostics, "WWP005", path, "File extension is not allowed by Package Runtime Policy.");
          unpacked += record.UncompressedSize;
          if (unpacked > maxBytes) Error(diagnostics, "WWP004", "$package", "Unpacked package size exceeds the frozen limit.");
          if (record.UncompressedSize > 1024 * 1024 && record.CompressedSize > 0 && record.UncompressedSize / Math.Max(1.0, record.CompressedSize) > 200.0)
            Error(diagnostics, "WWT010", path, "Compression ratio exceeds the server safety limit.");
        }

        if (!diagnostics.Any(d => d.severity == "error")) {
          try {
            using (var stream = new MemoryStream(packageBytes, false))
            using (var archive = new ZipArchive(stream, ZipArchiveMode.Read, true, Encoding.UTF8)) {
              foreach (var entry in archive.Entries) {
                if (entry.FullName.EndsWith("/", StringComparison.Ordinal)) continue;
                var path = NormalizePath(entry.FullName, maxPath, diagnostics);
                if (path == null) continue;
                using (var source = entry.Open()) using (var target = new MemoryStream()) {
                  CopyLimited(source, target, maxBytes);
                  var bytes = target.ToArray();
                  var record = records.First(r => r.Name == entry.FullName);
                  if (Crc32.Compute(bytes) != record.Crc32) Error(diagnostics, "WWT007", path, "ZIP entry CRC mismatch.");
                  files[path] = bytes;
                }
              }
            }
          } catch (InvalidDataException) { Error(diagnostics, "WWT007", "$package", "Malformed ZIP data or unsupported compressed entry."); }
        }

        IDictionary<string, object> manifest = null;
        string manifestText = null, manifestHash = null, appId = null, version = null, sdkVersion = null;
        int? manifestVersion = null;
        string[] requested = new string[0];
        if (!files.ContainsKey("manifest.json")) Error(diagnostics, "WWP001", "manifest.json", "ZIP root manifest.json is required.");
        else {
          try {
            manifestText = StrictUtf8.GetString(files["manifest.json"]);
            manifest = Obj(Json.DeserializeObject(manifestText));
            var canonical = Canonical.Write(manifest);
            manifestHash = Sha(StrictUtf8.GetBytes(canonical));
            manifestVersion = manifest.ContainsKey("manifestVersion") ? ToInt(manifest["manifestVersion"]) : 1;
            if ((manifest.ContainsKey("manifestVersion") && manifestVersion != 2) || (!manifest.ContainsKey("manifestVersion") && manifestVersion != 1))
              Error(diagnostics, "WWM005", "manifest.json$/manifestVersion", "Unsupported explicit Manifest version.");
            var schema = manifestVersion == 2 ? schema2 : schema1;
            ValidateManifest(manifest, schema, manifestVersion.Value, permissions, diagnostics, out requested, out sdkVersion);
            appId = Str(manifest, "id"); version = Str(manifest, "version");
            if (!SafeId.IsMatch(appId ?? "")) Error(diagnostics, "WWM002", "manifest.json$/id", "Manifest id is invalid.");
            if (!SafeVersion.IsMatch(version ?? "")) Error(diagnostics, "WWM002", "manifest.json$/version", "Manifest version is invalid.");
            if (!String.Equals(appId, expectedId, StringComparison.Ordinal)) Error(diagnostics, "WWT002", "manifest.json$/id", "Request appId does not match ZIP Manifest id.");
            if (!String.Equals(version, expectedVersion, StringComparison.Ordinal)) Error(diagnostics, "WWT003", "manifest.json$/version", "Request version does not match ZIP Manifest version.");
            if (File.Exists(outerPath)) {
              var outer = Obj(Json.DeserializeObject(StrictUtf8.GetString(File.ReadAllBytes(outerPath))));
              if (!String.Equals(Canonical.Write(outer), canonical, StringComparison.Ordinal)) Error(diagnostics, "WWT001", "manifest.json", "Outer submitted Manifest is not canonically equal to ZIP root manifest.json.");
            }
            var entry = Str(manifest, "entry");
            if (String.IsNullOrEmpty(entry) || !files.ContainsKey(entry)) Error(diagnostics, "WWP006", entry ?? "manifest.json$/entry", "Manifest HTML entry does not exist in the package.");
            else if (!new[] { ".html", ".htm" }.Contains(Path.GetExtension(entry), StringComparer.OrdinalIgnoreCase)) Error(diagnostics, "WWP006", entry, "Manifest entry must be HTML.");
            ScanSources(files, diagnostics);
          } catch (DecoderFallbackException) { Error(diagnostics, "WWP007", "manifest.json", "Manifest must be valid UTF-8."); }
          catch (InvalidOperationException) { Error(diagnostics, "WWM001", "manifest.json", "Manifest must be a JSON object."); }
          catch (ArgumentException) { Error(diagnostics, "WWM001", "manifest.json", "Manifest JSON is invalid."); }
        }
        var passed = !diagnostics.Any(d => d.severity == "error");
        return new Result {
          reportId = "wwsv1-" + submissionId + "-" + packageHash.Substring(0, 16),
          validatedAt = DateTime.UtcNow.ToString("o", CultureInfo.InvariantCulture), packageSha256 = packageHash,
          packageSize = packageBytes.LongLength, sourceManifestSha256 = manifestHash, manifestVersion = manifestVersion,
          appId = appId, version = version, publisherId = publisherId, sdkVersion = sdkVersion, submissionId = submissionId,
          normalizedAppIdentity = new Dictionary<string, object> { { "appId", appId }, { "version", version }, { "publisherId", publisherId } },
          schemaResult = diagnostics.Any(d => d.severity == "error" && d.ruleId.StartsWith("WWM")) ? "failed" : "passed",
          packagePolicyResult = diagnostics.Any(d => d.severity == "error" && !d.ruleId.StartsWith("WWM")) ? "failed" : "passed",
          requestedPermissions = requested, diagnostics = diagnostics.ToArray(), passed = passed
        };
      }

      public static Result Fatal(string zip, string publisher, string submission, string rule, string message, string category) {
        byte[] bytes = File.Exists(zip) ? File.ReadAllBytes(zip) : new byte[0];
        return new Result { reportId = "wwsv1-" + submission + "-fatal", validatedAt = DateTime.UtcNow.ToString("o"),
          packageSha256 = Sha(bytes), packageSize = bytes.LongLength, publisherId = publisher, submissionId = submission,
          normalizedAppIdentity = new Dictionary<string, object> { { "appId", null }, { "version", null }, { "publisherId", publisher } },
          schemaResult = "failed", packagePolicyResult = "failed", diagnostics = new[] { new Diagnostic { ruleId = rule, severity = "error", path = "$package", message = message, metadata = new Dictionary<string, object> { { "category", category } } } }, passed = false };
      }

      static void ValidateManifest(IDictionary<string, object> manifest, IDictionary<string, object> schema, int version,
          IDictionary<string, object> permissionRegistry, List<Diagnostic> diagnostics, out string[] requested, out string sdkVersion) {
        requested = new string[0]; sdkVersion = null;
        var sourceSchema = Obj(Obj(schema["$defs"])["sourceManifest"]);
        SchemaValidate(manifest, sourceSchema, schema, "manifest.json$", diagnostics);
        foreach (var field in new[] { "catalog", "package", "runtime" }) if (manifest.ContainsKey(field)) Error(diagnostics, "WWM003", "manifest.json$/" + field, "Published-only field is forbidden in a Source Manifest.");
        if (manifest.ContainsKey("launch")) Error(diagnostics, "WWM004", "manifest.json$/launch", "Platform-reserved field requires review.", "warning");
        if (version == 1) return;
        var sdk = manifest.ContainsKey("sdk") ? Obj(manifest["sdk"]) : null;
        sdkVersion = sdk == null ? null : Str(sdk, "apiVersion");
        if (sdkVersion != "1") Error(diagnostics, "WWM009", "manifest.json$/sdk/apiVersion", "Unsupported SDK API version.");
        var values = manifest.ContainsKey("permissions") ? Arr(manifest["permissions"]).Select(Convert.ToString).ToArray() : new string[0];
        requested = values;
        var declarable = new HashSet<string>(Arr(Obj(permissionRegistry["sourceDeclaration"])["declarablePermissionIds"]).Select(Convert.ToString), StringComparer.Ordinal);
        var seen = new HashSet<string>(StringComparer.Ordinal);
        foreach (var permission in values) {
          if (!seen.Add(permission)) Error(diagnostics, "WWM007", "manifest.json$/permissions", "Duplicate permission declaration.");
          if (permission.Contains("*") || permission.StartsWith("native", StringComparison.OrdinalIgnoreCase) || permission.StartsWith("system", StringComparison.OrdinalIgnoreCase) || permission.StartsWith("device.*", StringComparison.OrdinalIgnoreCase))
            Error(diagnostics, "WWM008", "manifest.json$/permissions", "Wildcard or private permission declaration is forbidden.");
          else if (!declarable.Contains(permission)) Error(diagnostics, "WWM006", "manifest.json$/permissions", "Permission is not source-declarable.");
        }
      }

      static void SchemaValidate(object value, IDictionary<string, object> schema, IDictionary<string, object> root,
          string path, List<Diagnostic> diagnostics) {
        if (schema.ContainsKey("$ref")) {
          var reference = Convert.ToString(schema["$ref"]);
          if (reference.StartsWith("#/$defs/", StringComparison.Ordinal))
            SchemaValidate(value, Obj(Obj(root["$defs"])[reference.Substring(8)]), root, path, diagnostics);
          return;
        }
        if (schema.ContainsKey("allOf")) foreach (var part in Arr(schema["allOf"])) SchemaValidate(value, Obj(part), root, path, diagnostics);
        if (schema.ContainsKey("type") && !MatchesType(value, schema["type"])) { Error(diagnostics, "WWM002", path, "Manifest value has the wrong JSON type."); return; }
        if (schema.ContainsKey("const") && Canonical.Write(value) != Canonical.Write(schema["const"])) Error(diagnostics, "WWM002", path, "Manifest value does not match the required constant.");
        if (schema.ContainsKey("enum") && !Arr(schema["enum"]).Any(item => Canonical.Write(item) == Canonical.Write(value))) Error(diagnostics, "WWM002", path, "Manifest value is outside the allowed enum.");
        var text = value as string;
        if (text != null) {
          if (schema.ContainsKey("minLength") && text.Length < Convert.ToInt32(schema["minLength"])) Error(diagnostics, "WWM002", path, "Manifest string is too short.");
          if (schema.ContainsKey("pattern") && !Regex.IsMatch(text, Convert.ToString(schema["pattern"]), RegexOptions.CultureInvariant)) Error(diagnostics, "WWM002", path, "Manifest string does not match its schema pattern.");
        }
        var obj = value as IDictionary<string, object>;
        if (obj != null) {
          if (schema.ContainsKey("required")) foreach (var field in Arr(schema["required"]).Select(Convert.ToString))
            if (!obj.ContainsKey(field)) Error(diagnostics, "WWM002", path + "/" + field, "Required Manifest field is missing.");
          if (schema.ContainsKey("properties")) foreach (var property in Obj(schema["properties"]))
            if (obj.ContainsKey(property.Key)) SchemaValidate(obj[property.Key], Obj(property.Value), root, path + "/" + property.Key, diagnostics);
        }
        var array = value as object[];
        if (array != null) {
          if (schema.ContainsKey("minItems") && array.Length < Convert.ToInt32(schema["minItems"])) Error(diagnostics, "WWM002", path, "Manifest array is too short.");
          if (schema.ContainsKey("uniqueItems") && Convert.ToBoolean(schema["uniqueItems"]) && array.Select(Canonical.Write).Distinct(StringComparer.Ordinal).Count() != array.Length) Error(diagnostics, "WWM002", path, "Manifest array items must be unique.");
          if (schema.ContainsKey("items")) foreach (var item in array) SchemaValidate(item, Obj(schema["items"]), root, path + "/*", diagnostics);
        }
      }

      static bool MatchesType(object value, object typeSpec) {
        var types = typeSpec is string ? new[] { (string)typeSpec } : Arr(typeSpec).Select(Convert.ToString).ToArray();
        return types.Any(type => type == "null" && value == null
          || type == "object" && value is IDictionary<string, object>
          || type == "array" && value is object[]
          || type == "string" && value is string
          || type == "boolean" && value is bool
          || type == "integer" && (value is int || value is long)
          || type == "number" && (value is int || value is long || value is decimal || value is double));
      }

      static void ScanSources(IDictionary<string, byte[]> files, List<Diagnostic> diagnostics) {
        foreach (var item in files.Where(f => new[] { ".html", ".htm", ".js", ".css" }.Contains(Path.GetExtension(f.Key), StringComparer.OrdinalIgnoreCase))) {
          string text; try { text = StrictUtf8.GetString(item.Value); } catch { Error(diagnostics, "WWP007", item.Key, "Text source must be UTF-8."); continue; }
          if (Regex.IsMatch(text, "<script[^>]+type\\s*=\\s*['\"]module['\"]|(^|[^\\w])(?:import|export)\\s", RegexOptions.IgnoreCase | RegexOptions.Multiline)) Error(diagnostics, "WWS001", item.Key, "ES Modules are unsupported.");
          if (Regex.IsMatch(text, "(?:src|href)\\s*=\\s*['\"](?:https?:)?//", RegexOptions.IgnoreCase)) Error(diagnostics, "WWS002", item.Key, "External resource dependency is unsupported.");
          if (text.Contains("WebWindowsNative") || text.Contains("NativeAdapter")) Error(diagnostics, "WWS003", item.Key, "Private Native API reference is forbidden.");
          if (Regex.IsMatch(text, "\\bwindow\\.WebWindows\\.apps\\b")) Error(diagnostics, "WWS004", item.Key, "Shell internal API reference is forbidden.");
          if (Regex.IsMatch(text, "\\b(?:fetch|XMLHttpRequest|WebSocket)\\s*\\(", RegexOptions.IgnoreCase)) Error(diagnostics, "WWS005", item.Key, "Static network reference will be unavailable.", "warning");
        }
      }

      static string NormalizePath(string value, int max, List<Diagnostic> diagnostics) {
        var path = (value ?? "").Replace('\\', '/');
        if (path.Length == 0 || path.Length > max || path.IndexOf('\0') >= 0 || path.StartsWith("/") || Regex.IsMatch(path, "^[A-Za-z]:") || path.Split('/').Any(p => p.Length == 0 || p == "." || p == "..")) {
          Error(diagnostics, "WWP002", value ?? "$package", "Unsafe ZIP path."); return null;
        }
        return path;
      }
      static void CopyLimited(Stream source, Stream target, long max) { var buffer = new byte[81920]; long total = 0; int read; while ((read = source.Read(buffer, 0, buffer.Length)) > 0) { total += read; if (total > max) throw new InvalidDataException(); target.Write(buffer, 0, read); } }
      static object ParseFile(string path) { return Json.DeserializeObject(File.ReadAllText(path, Encoding.UTF8)); }
      static IDictionary<string, object> Obj(object value) { var result = value as IDictionary<string, object>; if (result == null) throw new InvalidOperationException(); return result; }
      static object[] Arr(object value) { return value as object[] ?? new object[0]; }
      static string Str(IDictionary<string, object> value, string key) { return value != null && value.ContainsKey(key) ? Convert.ToString(value[key], CultureInfo.InvariantCulture) : null; }
      static int? ToInt(object value) { try { return Convert.ToInt32(value, CultureInfo.InvariantCulture); } catch { return null; } }
      static string Sha(byte[] bytes) { using (var sha = SHA256.Create()) return BitConverter.ToString(sha.ComputeHash(bytes)).Replace("-", "").ToLowerInvariant(); }
      internal static void Error(List<Diagnostic> items, string rule, string path, string message, string severity = "error") { items.Add(new Diagnostic { ruleId = rule, severity = severity, path = path, message = message }); }
    }

    internal sealed class ZipRecord { public string Name; public uint Crc32; public long CompressedSize, UncompressedSize, LocalOffset, DataStart, DataEnd; public bool IsDirectory, IsSpecial; }
    internal static class ZipPreflight {
      public static List<ZipRecord> Read(byte[] data, List<Diagnostic> diagnostics) {
        var result = new List<ZipRecord>(); int eocd = Find(data, 0x06054b50, Math.Max(0, data.Length - 65557));
        if (eocd < 0 || eocd + 22 > data.Length) throw new InvalidDataException();
        int count = U16(data, eocd + 10); long centralSize = U32(data, eocd + 12), centralOffset = U32(data, eocd + 16);
        if (centralOffset + centralSize > eocd || count == 0xffff) throw new InvalidDataException();
        int p = (int)centralOffset;
        for (int i = 0; i < count; i++) {
          if (p + 46 > data.Length || U32(data, p) != 0x02014b50) throw new InvalidDataException();
          int flags = U16(data, p + 8), method = U16(data, p + 10), nameLen = U16(data, p + 28), extraLen = U16(data, p + 30), commentLen = U16(data, p + 32);
          long compressed = U32(data, p + 20), uncompressed = U32(data, p + 24), local = U32(data, p + 42); uint external = U32(data, p + 38);
          if ((flags & 1) != 0) Validator.Error(diagnostics, "WWT006", "$package", "Encrypted ZIP entries are unsupported.");
          if (method != 0 && method != 8) Validator.Error(diagnostics, "WWT008", "$package", "Unsupported ZIP compression method.");
          if (compressed == uint.MaxValue || uncompressed == uint.MaxValue || local == uint.MaxValue) Validator.Error(diagnostics, "WWT008", "$package", "ZIP64 entries are unsupported by validator v1.");
          if (p + 46 + nameLen + extraLen + commentLen > data.Length) throw new InvalidDataException();
          var nameBytes = data.Skip(p + 46).Take(nameLen).ToArray();
          string name;
          try { name = ((flags & 0x800) != 0 ? StrictUtf8 : Encoding.GetEncoding(437, EncoderFallback.ExceptionFallback, DecoderFallback.ExceptionFallback)).GetString(nameBytes); }
          catch { Validator.Error(diagnostics, "WWT012", "$package", "ZIP path encoding is invalid."); name = "invalid-path-" + i; }
          if (local + 30 > data.Length || U32(data, (int)local) != 0x04034b50) throw new InvalidDataException();
          int localName = U16(data, (int)local + 26), localExtra = U16(data, (int)local + 28); long start = local + 30 + localName + localExtra, end = start + compressed;
          if (end > centralOffset) throw new InvalidDataException();
          int unixType = (int)((external >> 16) & 0xF000); bool special = unixType != 0 && unixType != 0x8000 && unixType != 0x4000;
          result.Add(new ZipRecord { Name = name, Crc32 = U32(data, p + 16), CompressedSize = compressed, UncompressedSize = uncompressed, LocalOffset = local, DataStart = start, DataEnd = end, IsDirectory = name.EndsWith("/"), IsSpecial = special });
          p += 46 + nameLen + extraLen + commentLen;
        }
        var spans = result.OrderBy(r => r.LocalOffset).ToArray();
        for (int i = 1; i < spans.Length; i++) if (spans[i].LocalOffset < spans[i - 1].DataEnd) Validator.Error(diagnostics, "WWT009", "$package", "Overlapping ZIP entries are forbidden.");
        return result;
      }
      static int Find(byte[] data, uint sig, int min) { for (int i = data.Length - 22; i >= min; i--) if (U32(data, i) == sig) return i; return -1; }
      static ushort U16(byte[] b, int p) { return (ushort)(b[p] | b[p + 1] << 8); }
      static uint U32(byte[] b, int p) { return (uint)(b[p] | b[p + 1] << 8 | b[p + 2] << 16 | b[p + 3] << 24); }
    }

    internal static class Crc32 {
      static readonly uint[] Table = Build();
      public static uint Compute(byte[] bytes) { uint crc = 0xffffffff; foreach (var b in bytes) crc = Table[(crc ^ b) & 255] ^ (crc >> 8); return crc ^ 0xffffffff; }
      static uint[] Build() { var t = new uint[256]; for (uint n = 0; n < 256; n++) { uint c = n; for (int k = 0; k < 8; k++) c = (c & 1) != 0 ? 0xedb88320 ^ (c >> 1) : c >> 1; t[n] = c; } return t; }
    }

    internal static class Canonical {
      public static string Write(object value) {
        if (value == null) return "null";
        var obj = value as IDictionary<string, object>;
        if (obj != null) return "{" + String.Join(",", obj.OrderBy(x => x.Key, StringComparer.Ordinal).Select(x => Quote(x.Key) + ":" + Write(x.Value))) + "}";
        var array = value as object[]; if (array != null) return "[" + String.Join(",", array.Select(Write)) + "]";
        if (value is string) return Quote((string)value);
        if (value is bool) return (bool)value ? "true" : "false";
        if (value is int || value is long || value is decimal || value is double) return EcmaNumber(Convert.ToDouble(value, CultureInfo.InvariantCulture));
        throw new InvalidOperationException();
      }
      static string EcmaNumber(double value) {
        if (Double.IsNaN(value) || Double.IsInfinity(value)) throw new InvalidOperationException();
        if (value == 0) return "0";
        var text = ShortestRoundTrip(value).ToLowerInvariant();
        var exponent = 0;
        var e = text.IndexOf('e');
        if (e >= 0) { exponent = Int32.Parse(text.Substring(e + 1), CultureInfo.InvariantCulture); text = text.Substring(0, e); }
        var negative = text.StartsWith("-", StringComparison.Ordinal);
        if (negative) text = text.Substring(1);
        var dot = text.IndexOf('.');
        var before = dot < 0 ? text.Length : dot;
        var rawDigits = text.Replace(".", "");
        var leadingZeros = rawDigits.Length - rawDigits.TrimStart('0').Length;
        var digits = rawDigits.TrimStart('0').TrimEnd('0');
        if (digits.Length == 0) return "0";
        var decimalPosition = before + exponent - leadingZeros;
        string result;
        if (decimalPosition > 0 && decimalPosition <= 21) {
          result = digits.Length <= decimalPosition
            ? digits + new string('0', decimalPosition - digits.Length)
            : digits.Substring(0, decimalPosition) + "." + digits.Substring(decimalPosition);
        } else if (decimalPosition <= 0 && decimalPosition > -6) {
          result = "0." + new string('0', -decimalPosition) + digits;
        } else {
          result = digits.Substring(0, 1) + (digits.Length > 1 ? "." + digits.Substring(1) : "") +
            "e" + (decimalPosition - 1 >= 0 ? "+" : "") + (decimalPosition - 1).ToString(CultureInfo.InvariantCulture);
        }
        return negative ? "-" + result : result;
      }
      static string ShortestRoundTrip(double value) {
        var bits = BitConverter.DoubleToInt64Bits(value);
        for (var precision = 1; precision <= 17; precision++) {
          var candidate = value.ToString("G" + precision.ToString(CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);
          double parsed;
          if (Double.TryParse(candidate, NumberStyles.Float, CultureInfo.InvariantCulture, out parsed) &&
              BitConverter.DoubleToInt64Bits(parsed) == bits) return candidate;
        }
        return value.ToString("G17", CultureInfo.InvariantCulture);
      }
      static string Quote(string value) { return Json.Serialize(value); }
    }
  }
}
