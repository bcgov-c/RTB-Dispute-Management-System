using CM.Common.Utilities;
using GraphQL;
using GraphQL.SystemTextJson;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace GraphQl.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddGraphQl(this IServiceCollection services, IConfiguration configuration)
    {
        var prefix = configuration.GetServiceRoutePrefix();

        services.AddSingleton<IDocumentExecuter, DocumentExecuter>();
        services.AddSingleton<IDocumentWriter, DocumentWriter>();

        var authRule = new RequiresAuthValidationRule();

        services.Configure<GraphQlSettings>(settings =>
        {
            settings.BuildUserContext = ctx => new GraphQlUserContext { User = ctx.User };
            settings.ValidationRules.Add(authRule);
            settings.GraphQlPath = "/" + prefix;
        });

        return services;
    }

    public static void UseGraphQlWithAuth(this IApplicationBuilder app)
    {
        app.UseMiddleware<GraphQlMiddleware>();
    }
}