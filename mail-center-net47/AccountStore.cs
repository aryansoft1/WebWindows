using System;
using System.Configuration;
using System.Security.Cryptography;
using System.Text;
using MySql.Data.MySqlClient;
using System.Collections.Generic;

namespace WebWindows.MailCenter
{
    internal sealed class MailAccount
    {
        public string Id; public string Provider; public string DisplayName; public string Email; public string Password;
    }

    internal static class AccountStore
    {
        private static string ConnectionString => Required("MailCenterConnectionString");
        private static byte[] Key => Convert.FromBase64String(Required("MailCenterEncryptionKeyBase64"));
        private static string Required(string key)
        {
            var value = ConfigurationManager.AppSettings[key];
            if (string.IsNullOrWhiteSpace(value)) throw new InvalidOperationException("Mail Center is not configured: " + key);
            return value;
        }
        internal static string HealthStatus()
        {
            var connectionString = ConfigurationManager.AppSettings["MailCenterConnectionString"];
            var key = ConfigurationManager.AppSettings["MailCenterEncryptionKeyBase64"];
            if (string.IsNullOrWhiteSpace(connectionString)) return "missing_connection_string";
            if (string.IsNullOrWhiteSpace(key)) return "missing_encryption_key";
            try { if (Convert.FromBase64String(key).Length != 32) return "invalid_encryption_key"; }
            catch (FormatException) { return "invalid_encryption_key"; }
            try
            {
                using (var connection = new MySqlConnection(connectionString))
                using (var command = connection.CreateCommand())
                {
                    connection.Open(); command.CommandText = "SELECT 1 FROM webwindows_mail_accounts LIMIT 1"; command.ExecuteScalar();
                    command.CommandText = "SELECT 1 FROM webwindows_mail_state LIMIT 1"; command.ExecuteScalar();
                    return "ready";
                }
            }
            catch (MySqlException) { return "database_or_schema_unavailable"; }
            catch (InvalidOperationException) { return "database_or_schema_unavailable"; }
        }
        internal static string Encrypt(string value)
        {
            if (Key.Length != 32) throw new InvalidOperationException("MailCenterEncryptionKeyBase64 must contain 32 bytes.");
            using (var aes = Aes.Create())
            {
                aes.Key = Key; aes.GenerateIV(); aes.Mode = CipherMode.CBC; aes.Padding = PaddingMode.PKCS7;
                using (var encryptor = aes.CreateEncryptor())
                {
                    var plain = Encoding.UTF8.GetBytes(value);
                    var cipher = encryptor.TransformFinalBlock(plain, 0, plain.Length);
                    using (var hmac = new HMACSHA256(Key))
                    {
                        var payload = new byte[aes.IV.Length + cipher.Length];
                        Buffer.BlockCopy(aes.IV, 0, payload, 0, aes.IV.Length); Buffer.BlockCopy(cipher, 0, payload, aes.IV.Length, cipher.Length);
                        var tag = hmac.ComputeHash(payload);
                        return Convert.ToBase64String(payload) + "." + Convert.ToBase64String(tag);
                    }
                }
            }
        }
        internal static string Decrypt(string value)
        {
            var parts = (value ?? "").Split('.'); if (parts.Length != 2) throw new CryptographicException("Invalid stored credential.");
            var payload = Convert.FromBase64String(parts[0]); var tag = Convert.FromBase64String(parts[1]);
            using (var hmac = new HMACSHA256(Key)) { var expected = hmac.ComputeHash(payload); var diff = expected.Length ^ tag.Length; for (var i = 0; i < Math.Min(expected.Length, tag.Length); i++) diff |= expected[i] ^ tag[i]; if (diff != 0) throw new CryptographicException("Credential integrity check failed."); }
            using (var aes = Aes.Create()) { aes.Key = Key; aes.Mode = CipherMode.CBC; aes.Padding = PaddingMode.PKCS7; var iv = new byte[aes.BlockSize / 8]; Buffer.BlockCopy(payload, 0, iv, 0, iv.Length); aes.IV = iv; using (var decryptor = aes.CreateDecryptor()) { var plain = decryptor.TransformFinalBlock(payload, iv.Length, payload.Length - iv.Length); return Encoding.UTF8.GetString(plain); } }
        }
        internal static void Save(string owner, MailAccount account)
        {
            owner = (owner ?? "").Trim();
            account.Email = (account.Email ?? "").Trim().ToLowerInvariant();
            account.DisplayName = (account.DisplayName ?? "").Trim();
            if (owner.Length == 0 || owner.Length > 64) throw new ArgumentException("Invalid account owner.");
            if (account.Email.Length == 0 || account.Email.Length > 254) throw new ArgumentException("Invalid email address.");
            if (account.DisplayName.Length == 0) account.DisplayName = account.Email;
            if (account.DisplayName.Length > 120) throw new ArgumentException("Display name is too long.");
            var id = Guid.NewGuid().ToString();
            using (var connection = new MySqlConnection(ConnectionString))
            using (var command = connection.CreateCommand())
            {
                command.CommandText = "INSERT INTO webwindows_mail_accounts (id,owner_username,provider,display_name,email_address,email_key,encrypted_password,created_at,updated_at) VALUES (@id,@owner,@provider,@name,@email,@emailKey,@password,NOW(),NOW()) ON DUPLICATE KEY UPDATE provider=@provider,display_name=@name,email_address=@email,encrypted_password=@password,updated_at=NOW()";
                command.Parameters.AddWithValue("@id", id); command.Parameters.AddWithValue("@owner", owner); command.Parameters.AddWithValue("@provider", account.Provider); command.Parameters.AddWithValue("@name", account.DisplayName); command.Parameters.AddWithValue("@email", account.Email); command.Parameters.AddWithValue("@emailKey", EmailKey(account.Email)); command.Parameters.AddWithValue("@password", Encrypt(account.Password));
                connection.Open(); command.ExecuteNonQuery();
            }
        }
        private static string EmailKey(string email)
        {
            var normalized = (email ?? "").Trim().ToLowerInvariant();
            using (var sha = SHA256.Create())
            {
                var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(normalized));
                var result = new StringBuilder(bytes.Length * 2);
                foreach (var b in bytes) result.Append(b.ToString("x2"));
                return result.ToString();
            }
        }
        internal static MailAccount Get(string owner, string id)
        {
            using (var connection = new MySqlConnection(ConnectionString)) using (var command = connection.CreateCommand())
            {
                command.CommandText = "SELECT id,provider,display_name,email_address,encrypted_password FROM webwindows_mail_accounts WHERE id=@id AND owner_username=@owner"; command.Parameters.AddWithValue("@id", id); command.Parameters.AddWithValue("@owner", owner); connection.Open();
                using (var row = command.ExecuteReader()) { if (!row.Read()) return null; return new MailAccount { Id=row.GetString(0), Provider=row.GetString(1), DisplayName=row.GetString(2), Email=row.GetString(3), Password=Decrypt(row.GetString(4)) }; }
            }
        }
        internal static List<MailAccount> List(string owner)
        {
            var list = new List<MailAccount>();
            using (var connection = new MySqlConnection(ConnectionString)) using (var command = connection.CreateCommand())
            {
                command.CommandText = "SELECT id,provider,display_name,email_address FROM webwindows_mail_accounts WHERE owner_username=@owner ORDER BY updated_at DESC"; command.Parameters.AddWithValue("@owner", owner); connection.Open();
                using (var rows = command.ExecuteReader()) while (rows.Read()) list.Add(new MailAccount { Id=rows.GetString(0), Provider=rows.GetString(1), DisplayName=rows.GetString(2), Email=rows.GetString(3) });
            }
            return list;
        }
        internal static void Delete(string owner, string id)
        {
            using (var connection = new MySqlConnection(ConnectionString))
            {
                connection.Open();
                using (var transaction = connection.BeginTransaction())
                {
                    using (var command = connection.CreateCommand())
                    {
                        command.Transaction = transaction;
                        command.CommandText = "DELETE s FROM webwindows_mail_state s INNER JOIN webwindows_mail_accounts a ON a.id=s.account_id WHERE a.id=@id AND a.owner_username=@owner";
                        command.Parameters.AddWithValue("@id", id); command.Parameters.AddWithValue("@owner", owner); command.ExecuteNonQuery();
                    }
                    using (var command = connection.CreateCommand())
                    {
                        command.Transaction = transaction;
                        command.CommandText = "DELETE FROM webwindows_mail_accounts WHERE id=@id AND owner_username=@owner";
                        command.Parameters.AddWithValue("@id", id); command.Parameters.AddWithValue("@owner", owner); command.ExecuteNonQuery();
                    }
                    transaction.Commit();
                }
            }
        }
        internal static bool IsRead(string accountId, string uid)
        {
            using (var connection=new MySqlConnection(ConnectionString)) using(var command=connection.CreateCommand()){command.CommandText="SELECT is_read FROM webwindows_mail_state WHERE account_id=@a AND message_uid=@u";command.Parameters.AddWithValue("@a",accountId);command.Parameters.AddWithValue("@u",uid);connection.Open();var value=command.ExecuteScalar();return value!=null&&Convert.ToInt32(value)!=0;}
        }
        internal static void MarkRead(string accountId,string uid)
        {
            using (var connection=new MySqlConnection(ConnectionString)) using(var command=connection.CreateCommand()){command.CommandText="INSERT INTO webwindows_mail_state (account_id,message_uid,is_read,updated_at) VALUES (@a,@u,1,NOW()) ON DUPLICATE KEY UPDATE is_read=1,updated_at=NOW()";command.Parameters.AddWithValue("@a",accountId);command.Parameters.AddWithValue("@u",uid);connection.Open();command.ExecuteNonQuery();}
        }
    }
}
