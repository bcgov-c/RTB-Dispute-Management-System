using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace CM.Common.Utilities;

public static class StringExtensions
{
    public static bool IsValidEmail(this string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return false;
        }

        try
        {
            email = Regex.Replace(email, @"(@)(.+)$", DomainMapper, RegexOptions.None, TimeSpan.FromMilliseconds(200));

            static string DomainMapper(Match match)
            {
                var idn = new IdnMapping();

                var domainName = idn.GetAscii(match.Groups[2].Value);

                return match.Groups[1].Value + domainName;
            }
        }
        catch (RegexMatchTimeoutException)
        {
            return false;
        }
        catch (ArgumentException)
        {
            return false;
        }

        try
        {
            return Regex.IsMatch(email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.IgnoreCase, TimeSpan.FromMilliseconds(250));
        }
        catch (RegexMatchTimeoutException)
        {
            return false;
        }
    }

    public static string ToEmailHint(this string email)
    {
        if (!string.IsNullOrWhiteSpace(email))
        {
            var emailHint = new StringBuilder();
            emailHint.Append(email.Substring(0, 2));
            emailHint.Append("************");

            var dotIndex = email.LastIndexOf('.') == -1 ? email.Length : email.LastIndexOf('.');

            emailHint.Append(email.Substring(dotIndex - 2));

            return emailHint.ToString();
        }

        return null;
    }

    public static string ToPhoneHint(this string phone)
    {
        if (phone != null)
        {
            var phoneHint = new StringBuilder();
            phoneHint.Append(phone.Substring(0, 2));
            phoneHint.Append("************");
            phoneHint.Append(phone.Substring(phone.Length - 2, 2));
            return phoneHint.ToString();
        }

        return null;
    }

    public static string ToAccessCodeHint(this string phone)
    {
        if (phone != null)
        {
            var phoneHint = new StringBuilder();
            phoneHint.Append(phone.Substring(0, 2));
            phoneHint.Append("**");
            phoneHint.Append(phone.Substring(phone.Length - 2, 2));
            return phoneHint.ToString();
        }

        return null;
    }

    public static string ToLowerIgnoreNull(this string value)
    {
        value = value?.ToLower(CultureInfo.InvariantCulture);
        return value;
    }

    public static bool IsNotNullAndEquals(this string str1, string str2)
    {
        if (str1 == null || str2 == null)
        {
            return false;
        }

        return str1.ToLowerIgnoreNull() == str2.ToLowerIgnoreNull();
    }

    public static string GetAbbreviation(params string[] paramArray)
    {
        var nameAbbreviation = new StringBuilder();
        foreach (var value in paramArray)
        {
            if (!string.IsNullOrWhiteSpace(value))
            {
                var splittedName = value.Split(' ').ToList();

                foreach (var name in splittedName.Where(name => !string.IsNullOrEmpty(name)))
                {
                    nameAbbreviation.Append(name[0] + ".");
                }
            }
        }

        return nameAbbreviation.Length != 0 ? nameAbbreviation.ToString().ToUpper() : null;
    }

    public static string GetPhoneNumber(this string input)
    {
        var strippedPhoneNumber = new string(input.Where(char.IsDigit).ToArray());
        if (strippedPhoneNumber.FirstOrDefault() == '1')
        {
            return strippedPhoneNumber.Substring(1);
        }

        return strippedPhoneNumber;
    }

    public static string Truncate(this string value, int maxLength)
    {
        return value?[..Math.Min(value.Length, maxLength)];
    }

    public static string ToAlphaNumeric(this string self, params char[] allowedCharacters)
    {
        return new string(Array.FindAll(self.ToCharArray(), c => char.IsLetterOrDigit(c) || allowedCharacters.Contains(c)));
    }

    public static bool CompareIgnoreCaseAndSpaces(this string source, string value)
    {
        if (!string.IsNullOrEmpty(source))
        {
            source = source.Trim();
        }

        if (!string.IsNullOrEmpty(value))
        {
            value = value.Trim();
        }

        return string.Equals(source, value, StringComparison.CurrentCultureIgnoreCase);
    }

    public static Dictionary<string, string> ConvertToDictionary(this string value, char separator)
    {
        var orders = new Dictionary<string, string>();

        var filtersArray = value.Split(",");

        foreach (var item in filtersArray)
        {
            var orderArray = item.Split(separator);
            orders.Add(orderArray[0].Trim(), orderArray[1].Trim());
        }

        return orders;
    }
}