using System.Collections;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace CM.ServiceBase;

public class SwaggerEnumerable<T> : IModelBinder
    where T : IEnumerable
{
    public Task BindModelAsync(ModelBindingContext bindingContext)
    {
        var val = bindingContext.ValueProvider.GetValue(bindingContext.FieldName);
        var first = string.Concat("[", string.Join(",", val.ToList()), "]");
        var model = JsonSerializer.Deserialize<T>(first, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        bindingContext.Result = ModelBindingResult.Success(model);
        return Task.CompletedTask;
    }
}