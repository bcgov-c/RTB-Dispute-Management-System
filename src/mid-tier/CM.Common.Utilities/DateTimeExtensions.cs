using System;

namespace CM.Common.Utilities;

public static class DateTimeExtensions
{
    private const string UtcIso8601 = "yyyy-MM-dd'T'HH:mm:ss.fffZ";

    private const string PstDateTime = "MMMM dd yyyy";

    public static DateTime GetCmDateTime(this DateTime dt)
    {
        return Convert.ToDateTime(dt.ToString(UtcIso8601));
    }

    public static string ToCmDateTimeString(this DateTime? dt)
    {
        return dt.HasValue ? dt.Value.ToString(UtcIso8601) : string.Empty;
    }

    public static string ToCmDateTimeString(this DateTime dt)
    {
        return dt.ToString(UtcIso8601);
    }

    public static string ToPstDateTime(this DateTime? dt)
    {
        return dt.HasValue ? dt.Value.ToPstDateTime() : string.Empty;
    }

    public static string ToPstDateTime(this DateTime dt)
    {
        return dt.ToLocalTime()
            .ToString(PstDateTime);
    }

    public static DateTime StartOfWeek(this DateTime dt, DayOfWeek startOfWeek)
    {
        var diff = (7 + (dt.DayOfWeek - startOfWeek)) % 7;

        return dt.AddDays(-1 * diff)
            .Date;
    }

    public static DateTime GetDatePart(this DateTime? dt)
    {
        if (dt.HasValue)
        {
            return dt.Value.Date;
        }

        return default;
    }

    public static double? Difference(this DateTime? date1, DateTime? date2)
    {
        if (date1 == null || date2 == null)
        {
            return null;
        }

        var ts = date2.Value - date1.Value;
        return ts.TotalMinutes;
    }

    public static int? DifferenceByDays(this DateTime? date1, DateTime? date2)
    {
        if (date1 == null || date2 == null)
        {
            return null;
        }

        var ts = date2.Value - date1.Value;
        return Math.Abs((int)ts.TotalDays);
    }
}