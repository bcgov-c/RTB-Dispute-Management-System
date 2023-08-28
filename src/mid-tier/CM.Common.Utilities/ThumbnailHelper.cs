using System;
using System.Threading.Tasks;
using NetVips;
using Serilog;
using Log = Serilog.Log;

namespace CM.Common.Utilities;

public static class ThumbnailHelper
{
    public static string FilePattern => "tn_{0}.jpg";

    public static async Task CreateAsync(string filePath, string mimeType, int height = 300, ILogger logger = null)
    {
        if (IsWhitelisted(mimeType) == false)
        {
            Log.Information("File {FilePath} is not whitelisted. Skipping thumbnail generation", filePath);
        }

        try
        {
            var param = $" --size 10000x{height} -o {string.Format(FilePattern, "%s")}";
            var shell = new ShellHelper(logger);
            await shell.BashAsync("vipsthumbnail", filePath + param);
        }
        catch (Exception exc)
        {
            Log.Error(exc, "Failed to generate thumbnail for {FilePath}", filePath);
        }
    }

    public static bool IsHealthy()
    {
        return ModuleInitializer.VipsInitialized;
    }

    private static bool IsWhitelisted(string mimeType)
    {
        var type = mimeType.GetTypeFromMime();
        return type is FileCategory.Image or FileCategory.Pdf;
    }
}