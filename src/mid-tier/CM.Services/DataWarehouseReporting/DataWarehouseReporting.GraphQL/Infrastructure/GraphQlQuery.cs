using System;
using System.Linq;
using GraphQL.Types;

namespace DataWarehouseReporting.GraphQL.Infrastructure;

public class GraphQlQuery : ObjectGraphType
{
    public GraphQlQuery(IServiceProvider serviceProvider)
    {
        var type = typeof(IQueryResolver);
        var resolversTypes = AppDomain.CurrentDomain.GetAssemblies()
            .SelectMany(s => s.GetTypes())
            .Where(p => type.IsAssignableFrom(p));

        foreach (var resolverType in resolversTypes)
        {
            if (resolverType.IsClass)
            {
                var resolverTypeInterface = resolverType.GetInterfaces().FirstOrDefault();
                if (resolverTypeInterface != null)
                {
                    var resolver = serviceProvider.GetService(resolverType) as IQueryResolver;
                    resolver?.Resolve(this);
                }
            }
        }
    }
}