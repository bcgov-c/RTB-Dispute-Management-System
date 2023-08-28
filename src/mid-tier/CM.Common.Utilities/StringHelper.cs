using System;
using System.Linq;
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

    public static bool IsDifferentInitials(string first, string second)
    {
        var firstSplitted = first.Split(' ').ToList();
        var secondSplitted = second.Split(' ').ToList();

        for (int i = 0; i < firstSplitted.Count; i++)
        {
            if (string.IsNullOrEmpty(firstSplitted[i]))
            {
                firstSplitted.RemoveAt(i);
            }
        }

        for (int i = 0; i < secondSplitted.Count; i++)
        {
            if (string.IsNullOrEmpty(secondSplitted[i]))
            {
                secondSplitted.RemoveAt(i);
            }
        }

        if (firstSplitted.Count != secondSplitted.Count)
        {
            return true;
        }

        for (int i = 0; i < firstSplitted.Count; i++)
        {
            if (firstSplitted[i][0] != secondSplitted[i][0])
            {
                return true;
            }
        }

        return false;
    }

    public static string GetRandomCode()
    {
        Random rnd = new Random();
        var num = rnd.Next(1000, 10000);
        return num.ToString();
    }
}