using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace CM.Common.Utilities;

public static class HashHelper
{
    public static string GetHash(string value)
    {
        var sb = new StringBuilder();

        using var hash = SHA256.Create();

        var enc = Encoding.UTF8;
        var result = hash.ComputeHash(enc.GetBytes(value));

        foreach (var b in result)
        {
            sb.Append(b.ToString("x2"));
        }

        return sb.ToString();
    }

    public static string EncryptPassword(string password, string username)
    {
        var clearBytes = Encoding.Unicode.GetBytes(password);
        using var encrypt = Aes.Create();

        var pdb = new Rfc2898DeriveBytes(username, new byte[] { 0x49, 0x76, 0x61, 0x6e, 0x20, 0x4d, 0x65, 0x64, 0x76, 0x65, 0x64, 0x65, 0x76 });
        encrypt.Key = pdb.GetBytes(32);
        encrypt.IV = pdb.GetBytes(16);
        using var ms = new MemoryStream();

        using (var cs = new CryptoStream(ms, encrypt.CreateEncryptor(), CryptoStreamMode.Write))
        {
            cs.Write(clearBytes, 0, clearBytes.Length);
            cs.Close();
        }

        var cipherPassword = Convert.ToBase64String(ms.ToArray());
        return cipherPassword;
    }

    public static string DecryptPassword(string cipherPassword, string username)
    {
        cipherPassword = cipherPassword.Replace(" ", "+");
        var cipherBytes = Convert.FromBase64String(cipherPassword);
        using var encrypt = Aes.Create();

        var pdb = new Rfc2898DeriveBytes(username, new byte[] { 0x49, 0x76, 0x61, 0x6e, 0x20, 0x4d, 0x65, 0x64, 0x76, 0x65, 0x64, 0x65, 0x76 });
        encrypt.Key = pdb.GetBytes(32);
        encrypt.IV = pdb.GetBytes(16);
        using var ms = new MemoryStream();

        using (var cs = new CryptoStream(ms, encrypt.CreateDecryptor(), CryptoStreamMode.Write))
        {
            cs.Write(cipherBytes, 0, cipherBytes.Length);
            cs.Close();
        }

        var password = Encoding.Unicode.GetString(ms.ToArray());
        return password;
    }

    public static string GetMd5Hash(string input)
    {
        using var md5 = MD5.Create();

        var data = md5.ComputeHash(Encoding.UTF8.GetBytes(input));
        var stringBuilder = new StringBuilder();

        foreach (var item in data)
        {
            stringBuilder.Append(item.ToString("x2"));
        }

        return stringBuilder.ToString();
    }
}