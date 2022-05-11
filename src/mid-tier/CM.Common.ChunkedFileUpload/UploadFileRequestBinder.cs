using System;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace CM.Common.ChunkedFileUpload;

public class UploadFileRequestBinder : IModelBinder
{
    private const string ContentRangeRegex = "^bytes ([\\d]+)-([\\d]+)\\/([\\d]+)$";

    private const string ContentRangeHeaderName = "Content-Range";

    public Task BindModelAsync(ModelBindingContext bindingContext)
    {
        if (bindingContext == null)
        {
            throw new ArgumentNullException(nameof(bindingContext));
        }

        var model = Activator.CreateInstance(bindingContext.ModelType) as UploadFileRequest;

        if (model == null)
        {
            return Task.CompletedTask;
        }

        var modelProperties = model.GetType().GetProperties();
        foreach (var modelProperty in modelProperties)
        {
            try
            {
                var contextValObject = bindingContext.ValueProvider.GetValue(modelProperty.Name);

                if (string.IsNullOrWhiteSpace(contextValObject.FirstValue))
                {
                    continue;
                }

                var typeConverter = TypeDescriptor.GetConverter(modelProperty.PropertyType);

                if (!typeConverter.CanConvertFrom(typeof(string)))
                {
                    continue;
                }

                var contextVal = typeConverter.ConvertFrom(contextValObject.FirstValue);
                modelProperty.SetValue(model, contextVal, null);
            }
            catch (Exception exc)
            {
                Debug.Write(exc.Message);
            }
        }

        var formFiles = bindingContext.ActionContext.HttpContext.Request.Form.Files;

        if (!formFiles.Any())
        {
            return Task.CompletedTask;
        }

        model.OriginalFile = formFiles.SingleOrDefault();

        string rangeHeader = bindingContext.HttpContext.Request.Headers[ContentRangeHeaderName];

        model.IsChunk = false;

        if (!string.IsNullOrEmpty(rangeHeader))
        {
            var match = Regex.Match(rangeHeader, ContentRangeRegex, RegexOptions.IgnoreCase);
            var bytesFrom = int.Parse(match.Groups[1].Value);
            var bytesTo = int.Parse(match.Groups[2].Value);
            var bytesFull = int.Parse(match.Groups[3].Value);

            model.IsLast = (bytesTo + 1) == bytesFull;
            model.IsChunk = true;
            model.ChunkNumber = 1;
            model.IsFirst = true;

            if (bytesFrom > 0)
            {
                var bytesSize = bytesTo - bytesFrom + 1;
                model.ChunkNumber = (bytesFrom / bytesSize) + 1;
                model.IsFirst = false;
            }
        }

        bindingContext.Result = ModelBindingResult.Success(model);

        return Task.CompletedTask;
    }
}