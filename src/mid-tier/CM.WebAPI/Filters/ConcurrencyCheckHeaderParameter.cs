using System.Linq;
using CM.Common.Utilities;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace CM.WebAPI.Filters;

public class ConcurrencyCheckHeaderParameter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var filterPipeline = context.ApiDescription.ActionDescriptor.FilterDescriptors;
        var isApplied = filterPipeline.Select(f => f.Filter).Any(f => f is ApplyConcurrencyCheckAttribute);

        if (isApplied)
        {
            operation.Parameters.Add(new OpenApiParameter
            {
                Name = ApiHeader.IfUnmodifiedSince,
                In = ParameterLocation.Header,
                Description = "Concurrency",
                Required = false,
                Schema = new OpenApiSchema { Type = "DateTime" }
            });
        }
    }
}