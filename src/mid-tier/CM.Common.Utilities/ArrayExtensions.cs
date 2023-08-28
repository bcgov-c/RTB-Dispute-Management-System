using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;

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

    public static IList<T> GetSingleFromNestedCollections<T>(this IList<ICollection<T>> values)
        where T : class
    {
        var res = new List<T>();

        foreach (var val in values)
        {
            if (val != null)
            {
                res.AddRange(val);
            }
        }

        return res;
    }
}