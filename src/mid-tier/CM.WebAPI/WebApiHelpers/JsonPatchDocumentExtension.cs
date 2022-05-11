using System.Collections.Generic;
using System.Linq;
using CM.Common.Utilities;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.JsonPatch.Operations;
using Newtonsoft.Json.Serialization;

namespace CM.WebAPI.WebApiHelpers;

public class JsonPatchDocumentExtension<TModel> : JsonPatchDocument<TModel>
    where TModel : class
{
    public JsonPatchDocumentExtension()

        // ReSharper disable once RedundantBaseConstructorCall
        : base()
    {
    }

    public JsonPatchDocumentExtension(List<Operation<TModel>> operations, IContractResolver contractResolver)
        : base(operations, contractResolver)
    {
    }

    public(bool Exists, T Value) GetValue<T>(string path)
    {
        var operation = Operations.FirstOrDefault(o => o.path == path);
        if (operation != null)
        {
            return (true, operation.value.ChangeType<T>());
        }

        return (false, default);
    }
}