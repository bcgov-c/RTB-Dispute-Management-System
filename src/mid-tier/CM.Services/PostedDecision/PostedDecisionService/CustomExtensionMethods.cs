using System;
using CM.Common.Utilities;
using CM.Services.PostedDecision.PostedDecisionDataService.IntegrationEvents.EventHandling;
using CM.UserResolverService;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CM.Services.PostedDecision.PostedDecisionDataService;

public static class CustomExtensionMethods
{
    public static IServiceCollection AddCustomDbContext(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("PdConnection");
        services.AddEntityFrameworkNpgsql()
            .AddDbContext<PostedDecisionContext>(c => c.UseNpgsql(connectionString), ServiceLifetime.Transient);

        return services;
    }

    public static IServiceCollection AddCustomIntegrations(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
        services.AddSingleton<IUserResolver, UserResolver>();

        services.AddTransient<PostedDecisionDataProcessingEventHandler, PostedDecisionDataProcessingEventHandler>();
        services.AddTransient<PostedDecisionRemovalEventHandler, PostedDecisionRemovalEventHandler>();

        return services;
    }

    public static IServiceCollection AddMapper(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
        return services;
    }

    public static IServiceCollection AddCustomCors(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddCors(
            options => options.AddPolicy(
                "AllowCors",
                builder =>
                {
                    builder
                        .AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .WithExposedHeaders(ApiHeader.Token, "Content-Type", ApiHeader.Authorization);
                }));

        return services;
    }
}