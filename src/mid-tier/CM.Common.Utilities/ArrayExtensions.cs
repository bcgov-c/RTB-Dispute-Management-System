using System.Collections.Generic;

namespace CM.Common.Utilities;

public static class ArrayExtensions
{
    public static string CreateString(this List<string> values, string separator, bool withSpace = false)
    {
        var result = string.Empty;

        foreach (var item in values)
        {
            result += item;
            result += withSpace ? separator + " " : separator;
        }

        return result.TrimEnd(' ').TrimEnd(',');
    }

    public static string CreateString(this byte[] values, string separator)
    {
        var result = string.Empty;

        foreach (var item in values)
        {
            result += item;
            result += separator + " ";
        }

        return result.TrimEnd(' ').TrimEnd(',');
    }

    public static string CreateString(this byte?[] values, string separator)
    {
        var result = string.Empty;

        foreach (var item in values)
        {
            result += item;
            result += separator + " ";
        }

        return result.TrimEnd(' ').TrimEnd(',');
    }

    public static string CreateString(this int[] values, string separator)
    {
        var result = string.Empty;

        foreach (var item in values)
        {
            result += item;
            result += separator + " ";
        }

        return result.TrimEnd(' ').TrimEnd(',');
    }
}