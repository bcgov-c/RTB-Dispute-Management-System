using System;
using System.Text;

namespace CM.Integration.Tests.Utils;

public static class Converters
{
    public static string EncodeTokenToBase64(string token, int fileId)
    {
        var data = Encoding.ASCII.GetBytes($"{token}:{fileId}");
        var base64Encoded = Convert.ToBase64String(data);

        return base64Encoded;
    }
}