using System.Diagnostics;
using System.Threading.Tasks;
using Serilog;

namespace CM.Common.Utilities;

public class ShellHelper
{
    private readonly ILogger _logger;

    public ShellHelper(ILogger logger)
    {
        _logger = logger;
    }

    public async Task<bool> BashAsync(string fileName, string args)
    {
        var processStartInfo = new ProcessStartInfo
        {
            FileName = fileName,
            Arguments = args,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };

        using var process = new Process
        {
            StartInfo = processStartInfo,
            EnableRaisingEvents = true
        };

        process.ErrorDataReceived += ProcessOnErrorDataReceived;
        try
        {
            process.Start();
            process.BeginErrorReadLine();
            await process.WaitForExitAsync();
        }
        finally
        {
            process.CancelErrorRead();
            process.Close();
        }

        return true;
    }

    public async Task<string> BashWithResultAsync(string fileName, string args)
    {
        var processStartInfo = new ProcessStartInfo
        {
            FileName = fileName,
            Arguments = args,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };

        using var process = new Process
        {
            StartInfo = processStartInfo,
            EnableRaisingEvents = true
        };

        string output;
        try
        {
            process.Start();
            output = await process.StandardOutput.ReadToEndAsync();
            await process.WaitForExitAsync();
        }
        finally
        {
            process.Close();
        }

        return output;
    }

    private void ProcessOnErrorDataReceived(object sender, DataReceivedEventArgs e)
    {
        _logger?.Information("Shell output {Data}", e.Data);
    }
}