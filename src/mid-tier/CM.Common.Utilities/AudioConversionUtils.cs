using System;

namespace CM.Common.Utilities;

public class AudioConversionUtils
{
    public static bool IsHealthy()
    {
        try
        {
            return "ffmpeg".Bash(" -version");
        }
        catch (Exception)
        {
            return false;
        }
    }

    public bool Convert(string filePathInput, string filePathOutput, int bitRate, int samplingRate, int channels)
    {
        var commandFfmpeg = $" -i {filePathInput} -vn -ar {samplingRate} -ac {channels} -acodec libmp3lame -b:a {bitRate} {filePathOutput}";
        return "ffmpeg".Bash(commandFfmpeg);
    }
}