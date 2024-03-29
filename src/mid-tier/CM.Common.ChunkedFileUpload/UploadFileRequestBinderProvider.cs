using System;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.ModelBinding.Binders;

namespace CM.Common.ChunkedFileUpload;

public class UploadFileRequestBinderProvider : IModelBinderProvider
{
    public IModelBinder GetBinder(ModelBinderProviderContext context)
    {
        if (context == null)
        {
            throw new ArgumentNullException(nameof(context));
        }

        if (context.Metadata.ModelType == typeof(UploadFileRequest))
        {
            return new BinderTypeModelBinder(typeof(UploadFileRequestBinder));
        }

        return null;
    }
}