using System;
using NetVips;

namespace CM.Common.Utilities;

public static class ThumbnailHelper
{
    public static string FilePattern => "tn_{0}.jpg";

    public static void Create(string filePath, int height = 300)
    {
        try
        {
            var param = $" --size 10000x{height} -o {string.Format(FilePattern, "%s")}";
            "vipsthumbnail".Bash(filePath + param);
        }
        catch (Exception exc)
        {
            Console.WriteLine(exc.Message);
        }
    }

    public static byte[] CreateThumbnail(string filePath, int height = 300)
    {
        try
        {
            var image = Image.Thumbnail(filePath, 10000, height);

            return image.WriteToBuffer(".jpg");
        }
        catch (Exception exc)
        {
            Console.WriteLine(exc.Message);

            return null;
        }
    }

    public static bool IsHealthy()
    {
        return ModuleInitializer.VipsInitialized;
    }
}