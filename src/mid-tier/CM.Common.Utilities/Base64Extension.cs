using System;
using System.Text;

namespace CM.Common.Utilities;

public static class Base64Extension
{
    public static string Base64Decode(this string base64EncodedData)
    {
        var base64EncodedBytes = Convert.FromBase64String(base64EncodedData);
        return Encoding.UTF8.GetString(base64EncodedBytes);
    }

    public static string Base64Encode(this string data)
    {
        var byteData = Encoding.UTF8.GetBytes(data);
        return Convert.ToBase64String(byteData);
    }

    public static bool IsBase64String(this string base64String)
    {
        if (string.IsNullOrEmpty(base64String) ||
            base64String.Length % 4 != 0 ||
            base64String.Contains(" ") ||
            base64String.Contains("\t") ||
            base64String.Contains("\r") ||
            base64String.Contains("\n"))
        {
            return false;
        }

        return true;
    }
}