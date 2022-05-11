using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace CM.Common.Utilities;

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field, AllowMultiple = false)]
public sealed class JsonValidationAttribute : ValidationAttribute
{
    private readonly bool _allowNull;

    public JsonValidationAttribute()
    {
        _allowNull = true;
    }

    public JsonValidationAttribute(bool allowNull)
    {
        _allowNull = allowNull;
    }

    public override bool IsValid(object value)
    {
        switch (_allowNull)
        {
            case false when value == null:
                return false;
            case true when value == null:
                return true;
        }

        if (value is not string json)
        {
            return false;
        }

        if (string.IsNullOrWhiteSpace(json))
        {
            return false;
        }

        try
        {
            JsonDocument.Parse(json);

            return true;
        }
        catch (JsonException)
        {
            return false;
        }
        catch (Exception)
        {
            return false;
        }
    }
}