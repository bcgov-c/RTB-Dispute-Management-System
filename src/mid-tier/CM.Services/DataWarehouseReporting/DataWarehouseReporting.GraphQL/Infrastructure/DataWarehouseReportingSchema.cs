using System;
using GraphQL.Types;
using Microsoft.Extensions.DependencyInjection;

namespace DataWarehouseReporting.GraphQL.Infrastructure;

public class DataWarehouseReportingSchema : Schema
{
    public DataWarehouseReportingSchema(IServiceProvider services)
        : base(services)
    {
        Query = services.GetService<GraphQlQuery>() ?? throw new InvalidOperationException();

        var mutations = services.GetService<GraphQlMutation>();
        if (mutations != null && mutations.ResolvedInterfaces.Count > 0)
        {
            Mutation = mutations;
        }
    }
}