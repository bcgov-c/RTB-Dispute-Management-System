using Microsoft.AspNetCore.StaticFiles;

namespace CM.Common.Utilities;

public static class MimeExtension
{
    public static string GetMimeTypeForFileExtension(this string filePath)
    {
        const string defaultContentType = "application/octet-stream";

        var provider = new FileExtensionContentTypeProvider();

        if (!provider.TryGetContentType(filePath, out var contentType))
        {
            contentType = defaultContentType;
        }

        return contentType;
    }

    public static FileCategory GetTypeFromMime(this string mimeType)
    {
        if (string.IsNullOrWhiteSpace(mimeType))
        {
            return FileCategory.Unknown;
        }

        var prefix = mimeType.Split('/')[0];

        if (mimeType == FileMimeTypes.Pdf)
        {
            return FileCategory.Pdf;
        }

        return prefix switch
        {
            "image" => FileCategory.Image,
            "video" => FileCategory.Video,
            "audio" => FileCategory.Audio,
            "application" => FileCategory.Document,
            "text" => FileCategory.Text,
            _ => FileCategory.Unknown
        };
    }
}

public enum FileCategory
{
    Image,
    Video,
    Audio,
    Document,
    Pdf,
    Text,
    Unknown
}