using System;
using System.Linq;
using GraphQL.Types;

namespace DataWarehouseReporting.GraphQL.Infrastructure;

public class GraphQlMutation : ObjectGraphType
{
    public GraphQlMutation(IServiceProvider serviceProvider)
    {
        var type = typeof(IMutationResolver);
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
                    var resolver = serviceProvider.GetService(resolverType) as IMutationResolver;
                    resolver?.Resolve(this);
                }
            }
        }
    }
}