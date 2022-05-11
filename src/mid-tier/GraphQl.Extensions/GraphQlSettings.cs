using System;
using System.Collections.Generic;
using GraphQL.Validation;
using Microsoft.AspNetCore.Http;

namespace GraphQl.Extensions;

public class GraphQlSettings
{
    public PathString GraphQlPath { get; set; } = "/api/graphql";

    public Func<HttpContext, IDictionary<string, object>> BuildUserContext { get; set; }

    public List<IValidationRule> ValidationRules { get; } = new();

    public bool EnableMetrics { get; set; }
}