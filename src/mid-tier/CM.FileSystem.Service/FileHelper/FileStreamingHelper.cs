using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Primitives;
using Microsoft.Net.Http.Headers;

namespace CM.FileSystem.Service.FileHelper;

public static class FileStreamingHelper
{
    private const int BoundaryLengthLimit = 1024;

    private const int BufferSize = 81920;

    public static async Task<(T model, LocalMultipartFileInfo file)>
        ParseRequestForm<T>(ControllerBase controller, string tempFolder, T model)
        where T : class
    {
        var(forms, file) = await ParseRequest(controller.Request, tempFolder);
        await UpdateAndValidateForm(controller, model, forms);
        return (model, file);
    }

    private static async Task<(Dictionary<string, StringValues> forms, LocalMultipartFileInfo file)> ParseRequest(HttpRequest request, string tempFolder)
    {
        if (tempFolder == null)
        {
            throw new ApplicationException("Request is not a multipart request");
        }

        return await ParseRequest(request, tempFolder, null);
    }

    private static async Task UpdateAndValidateForm<T>(ControllerBase controller, T model, Dictionary<string, StringValues> forms)
        where T : class
    {
        var formValueProvider = new FormValueProvider(BindingSource.Form, new FormCollection(forms), CultureInfo.CurrentCulture);
        await controller.TryUpdateModelAsync(model, string.Empty, formValueProvider);
        controller.TryValidateModel(model);
    }

    private static async Task<(Dictionary<string, StringValues>, LocalMultipartFileInfo)>

        // ReSharper disable once MethodOverloadWithOptionalParameter
        ParseRequest(HttpRequest request, string tempLoc, Func<MultipartSection, Task> fileHandler = null)
    {
        var file = new LocalMultipartFileInfo();

        fileHandler ??= HandleFileSection;

        if (!MultipartRequestHelper.IsMultipartContentType(request.ContentType))
        {
            throw new InvalidDataException("Request is not a multipart request");
        }

        var formAccumulator = default(KeyValueAccumulator);

        var boundary = MultipartRequestHelper.GetBoundary(
            MediaTypeHeaderValue.Parse(request.ContentType),
            BoundaryLengthLimit);

        var reader = new MultipartReader(boundary, request.Body);

        var section = await reader.ReadNextSectionAsync();

        while (section != null)
        {
            var hasContentDispositionHeader = ContentDispositionHeaderValue.TryParse(section.ContentDisposition, out var contentDisposition);
            if (hasContentDispositionHeader)
            {
                if (MultipartRequestHelper.HasFileContentDisposition(contentDisposition))
                {
                    await fileHandler(section);
                }
                else if (MultipartRequestHelper.HasFormDataContentDisposition(contentDisposition))
                {
                    formAccumulator = await AccumulateForm(formAccumulator, section, contentDisposition);
                }
            }

            section = await reader.ReadNextSectionAsync();
        }

        return (formAccumulator.GetResults(), file);

        async Task HandleFileSection(MultipartSection fileSection)
        {
            var guid = Guid.NewGuid();
            var targetFilePath = Path.Combine(tempLoc, guid.ToString());

            await using (var targetStream = File.Create(targetFilePath))
            {
                await fileSection.Body.CopyToAsync(targetStream);
                targetStream.Position = 0;
            }

            if (fileSection.Body.Length == 0)
            {
                throw new InvalidDataException("Trying to upload empty file");
            }

            var formFile = new LocalMultipartFileInfo
            {
                Name = fileSection.AsFileSection().FileName,
                FileName = fileSection.AsFileSection().Name,
                OriginalFileName = fileSection.AsFileSection().FileName,
                ContentType = fileSection.ContentType,
                Length = fileSection.Body.Length,
                TemporaryLocation = targetFilePath
            };

            file = formFile;
        }
    }

    private static async Task<KeyValueAccumulator> AccumulateForm(KeyValueAccumulator formAccumulator, MultipartSection section, ContentDispositionHeaderValue contentDisposition)
    {
        var key = MultipartRequestHelper.RemoveQuotes(contentDisposition.Name.Value);
        var encoding = MultipartRequestHelper.GetEncoding(section);
        using var streamReader = new StreamReader(section.Body, encoding, true, BufferSize, true);

        var value = await streamReader.ReadToEndAsync();
        if (string.Equals(value, "undefined", StringComparison.OrdinalIgnoreCase))
        {
            value = string.Empty;
        }

        formAccumulator.Append(key, value);

        if (formAccumulator.ValueCount > FormReader.DefaultValueCountLimit)
        {
            throw new InvalidDataException($"Form key count limit {FormReader.DefaultValueCountLimit} exceeded.");
        }

        return formAccumulator;
    }
}

public class MultipartFileInfo
{
    public long Length { get; set; }

    public string FileName { get; set; }

    public string OriginalFileName { get; set; }

    public string Name { get; set; }

    public string ContentType { get; set; }
}

public class LocalMultipartFileInfo : MultipartFileInfo
{
    public string TemporaryLocation { get; set; }

    public int AddedBy { get; set; }
}