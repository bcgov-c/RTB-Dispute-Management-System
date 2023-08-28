using System.IO;
using System.Threading.Tasks;
using CM.Common.Utilities;
using FFMpegCore;
using NetVips;
using UglyToad.PdfPig;

namespace CM.FileSystem.Service;

public static class FilePropertyInfoExtractor
{
    public static async Task<string> GenerateFileMetaSummary(FileInfo fileInfo, string mimeType)
    {
        var type = mimeType.GetTypeFromMime();

        return type switch
        {
            FileCategory.Image => GetImageMeta(fileInfo),
            FileCategory.Audio => await GetAudioVideoMeta(fileInfo),
            FileCategory.Video => await GetAudioVideoMeta(fileInfo),
            FileCategory.Document => string.Empty,
            FileCategory.Pdf => GetPdfMeta(fileInfo),
            FileCategory.Text => string.Empty,
            _ => string.Empty
        };
    }

    private static string GetImageMeta(FileSystemInfo fileInfo)
    {
        using var im = Image.NewFromFile(fileInfo.FullName);
        return $"{im.Width}x{im.Height}";
    }

    private static async Task<string> GetAudioVideoMeta(FileSystemInfo fileInfo)
    {
        var mediaInfo = await FFProbe.AnalyseAsync(fileInfo.FullName);
        return mediaInfo.Duration.ToString(@"hh\.mm\.ss");
    }

    private static string GetPdfMeta(FileSystemInfo fileInfo)
    {
        using var document = PdfDocument.Open(fileInfo.FullName);
        return $"{document.NumberOfPages} pages";
    }
}
