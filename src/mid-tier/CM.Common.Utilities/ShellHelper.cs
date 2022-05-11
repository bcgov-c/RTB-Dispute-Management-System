using System.Diagnostics;

namespace CM.Common.Utilities;

public static class ShellHelper
{
    public static bool Bash(this string fileName, string args)
    {
        var processStartInfo = new ProcessStartInfo
        {
            FileName = fileName,
            Arguments = args,
            RedirectStandardOutput = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };

        using var process = new Process { StartInfo = processStartInfo };

        process.Start();
        process.WaitForExit(10000);

        if (process.HasExited == false)
        {
            process.Kill();
            return false;
        }

        return true;
    }
}