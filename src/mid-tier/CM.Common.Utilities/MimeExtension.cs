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
}