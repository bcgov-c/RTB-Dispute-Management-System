namespace CM.Common.Utilities;

public class AudioConversionSettings
{
    public bool? Bypass { get; set; } = false;

    public int? AudioQuality { get; set; }

    public int? AudioSamplingRate { get; set; }

    public int? AudioChannels { get; set; }
}