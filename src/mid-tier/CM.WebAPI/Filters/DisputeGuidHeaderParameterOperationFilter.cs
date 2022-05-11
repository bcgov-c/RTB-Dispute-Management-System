using System.Collections.Generic;
using CM.Common.Utilities;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace CM.WebAPI.Filters;

public class DisputeGuidHeaderParameterOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        operation.Parameters ??= new List<OpenApiParameter>();

        operation.Parameters.Add(new OpenApiParameter
        {
            Name = ApiHeader.DisputeGuidToken,
            In = ParameterLocation.Header,
            Description = "RBAC and AuditLog",
            Required = false,
            Schema = new OpenApiSchema { Type = "guid" }
        });
    }
}