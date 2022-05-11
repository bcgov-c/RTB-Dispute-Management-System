using System.Diagnostics;

namespace CM.Common.Utilities;

public static class ResultExtension
{
    public static bool CheckSuccess(this int value)
    {
        return value > 0;
    }

    public static void AssertSuccess(this int value)
    {
        Debug.Assert(value > 0, $"Complete failed: {value} records affected");
    }
}