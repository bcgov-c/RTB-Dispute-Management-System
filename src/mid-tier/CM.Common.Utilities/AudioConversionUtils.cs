using System;
using System.Threading.Tasks;
using Serilog;

namespace CM.Common.Utilities;

public class AudioConversionUtils
{
    private readonly ILogger _logger;

    public AudioConversionUtils(ILogger logger)
    {
        _logger = logger;
    }

    public static async Task<bool> IsHealthy()
    {
        try
        {
            var shell = new ShellHelper(null);
            return await shell.BashAsync("ffmpeg", " -version");
        }
        catch (Exception)
        {
            return false;
        }
    }

    public async Task<bool> ConvertAsync(string filePathInput, string filePathOutput, int bitRate, int samplingRate, int channels)
    {
        var commandFfmpeg = $" -i {filePathInput} -vn -ar {samplingRate} -ac {channels} -acodec libmp3lame -b:a {bitRate} {filePathOutput}";
        var shell = new ShellHelper(_logger);
        return await shell.BashAsync("ffmpeg", commandFfmpeg);
    }

    public async Task<int> GetDuration(string filePath)
    {
        var commandFfmpeg = $"-i {filePath} -v quiet -show_entries format=duration -hide_banner -of default=noprint_wrappers=1:nokey=1";
        var shell = new ShellHelper(_logger);
        var duration = await shell.BashWithResultAsync("ffprobe", commandFfmpeg);
        return (int)Math.Round(float.Parse(duration));
    }
}