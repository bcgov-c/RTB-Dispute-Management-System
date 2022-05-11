using System.Text.RegularExpressions;

namespace CM.Common.Utilities;

public static class StringHelper
{
    public static string StripZipPostal(string zipPostal)
    {
        var rgx = new Regex("[^a-zA-Z0-9]");
        zipPostal = rgx.Replace(zipPostal, string.Empty);
        return zipPostal.ToLower();
    }

    public static string StripPhone(string phone)
    {
        const int canadianPhoneLength = 10;
        var rgx = new Regex("[^0-9]");
        phone = rgx.Replace(phone, string.Empty);
        if (phone.Length > canadianPhoneLength)
        {
            return phone.Substring(phone.Length - canadianPhoneLength);
        }

        return phone;
    }
}