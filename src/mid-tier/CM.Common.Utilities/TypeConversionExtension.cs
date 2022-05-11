using System;
using System.Globalization;

namespace CM.Common.Utilities;

public static class TypeConversionExtension
{
    public static T ToEnum<T>(this byte enumByte)
        where T : Enum
    {
        return (T)Enum.ToObject(typeof(T), enumByte);
    }

    public static T ChangeType<T>(this object value, CultureInfo cultureInfo)
    {
        var toType = typeof(T);

        switch (value)
        {
            case null:
                return default;
            case string when toType == typeof(Guid):
                return ChangeType<T>(new Guid(Convert.ToString(value, cultureInfo) ?? string.Empty), cultureInfo);
            case string s when s == string.Empty && toType != typeof(string):
                return ChangeType<T>(null, cultureInfo);
            case string:
                break;
            default:
            {
                if (typeof(T) == typeof(string))
                {
                    return ChangeType<T>(Convert.ToString(value, cultureInfo), cultureInfo);
                }

                break;
            }
        }

        if (toType.IsGenericType &&
            toType.GetGenericTypeDefinition() == typeof(Nullable<>))
        {
            toType = Nullable.GetUnderlyingType(toType);
        }

        var canConvert = toType is { IsValueType: true, IsEnum: false };
        if (canConvert)
        {
            return (T)Convert.ChangeType(value, toType, cultureInfo);
        }

        return (T)value;
    }

    public static T ChangeType<T>(this object value)
    {
        return ChangeType<T>(value, CultureInfo.CurrentCulture);
    }
}