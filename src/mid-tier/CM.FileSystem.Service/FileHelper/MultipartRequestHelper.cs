using System;
using System.IO;
using System.Linq;
using System.Text;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Primitives;
using Microsoft.Net.Http.Headers;

namespace CM.FileSystem.Service.FileHelper;

public static class MultipartRequestHelper
{
    private const string BoundaryName = "boundary";

    public static string RemoveQuotes(string input)
    {
        if (!string.IsNullOrEmpty(input) && input.Length >= 2 && input[0] == '"' && input[^1] == '"')
        {
            input = input.Substring(1, input.Length - 2);
        }

        return input;
    }

    public static string GetBoundary(MediaTypeHeaderValue contentType, int lengthLimit)
    {
        var boundary = RemoveQuotes(contentType.Boundary());
        if (string.IsNullOrWhiteSpace(boundary))
        {
            throw new InvalidDataException("Missing content-type boundary.");
        }

        if (boundary.Length > lengthLimit)
        {
            throw new InvalidDataException(
                $"Multipart boundary length limit {lengthLimit} exceeded.");
        }

        return boundary;
    }

    public static Encoding GetEncoding(MultipartSection section)
    {
        var hasMediaTypeHeader = MediaTypeHeaderValue.TryParse(
            section.ContentType,
            out var mediaType);

        if (!hasMediaTypeHeader)
        {
            return Encoding.UTF8;
        }

        return mediaType.Encoding;
    }

    public static string Boundary(this MediaTypeHeaderValue media)
    {
        return (
            from value in media.Parameters
            where string.Equals(value.Name.Value, BoundaryName, StringComparison.OrdinalIgnoreCase)
            select value.Value.Value).FirstOrDefault();
    }

    public static bool IsMultipartContentType(string contentType)
    {
        return !string.IsNullOrEmpty(contentType)
               && contentType.Contains("multipart/", StringComparison.OrdinalIgnoreCase);
    }

    public static bool HasFormDataContentDisposition(ContentDispositionHeaderValue contentDisposition)
    {
        // Content-Disposition: form-data; name="key";
        return contentDisposition != null
               && contentDisposition.DispositionType.Equals("form-data")
               && StringSegment.IsNullOrEmpty(contentDisposition.FileName)
               && StringSegment.IsNullOrEmpty(contentDisposition.FileNameStar);
    }

    public static bool HasFileContentDisposition(ContentDispositionHeaderValue contentDisposition)
    {
        return contentDisposition != null
               && contentDisposition.DispositionType.Equals("form-data")
               && (!StringSegment.IsNullOrEmpty(contentDisposition.FileName)
                   || !StringSegment.IsNullOrEmpty(contentDisposition.FileNameStar));
    }
}