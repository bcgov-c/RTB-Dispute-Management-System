using System;

namespace CM.Common.Utilities;

public static class IntegerExtensions
{
    public static int CountDigit(this int number)
    {
        return (int)Math.Floor(Math.Log10(number) + 1);
    }
}