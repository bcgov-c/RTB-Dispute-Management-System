using System;
using CM.Common.Utilities;
using CM.UserResolverService;
using DataWarehouseReporting.Data;
using IdentityServer4.AccessTokenValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Serilog;

namespace DataWarehouseReporting.API;

public static class ApplicationExtension
{
    public static IServiceCollection AddOidAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        var authority = configuration["OpenId:Authority"];
        var audience = configuration["OpenId:Audience"];

        services.AddAuthentication(IdentityServerAuthenticationDefaults.AuthenticationScheme)
            .AddIdentityServerAuthentication(options =>
            {
                options.Authority = authority;
                options.ApiName = audience;
            });

        services.AddAuthorization();

        return services;
    }

    public static IServiceCollection AddDb(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DwConnection");

        services.AddEntityFrameworkNpgsql()
            .AddDbContext<DataWarehouseReportingContext>(c => c.UseNpgsql(connectionString));

        return services;
    }

    public static IServiceCollection AddLogger(this IServiceCollection services, IConfiguration configuration)
    {
        var logger = GetGlobalLogger(configuration);
        services.AddSingleton(logger);

        return services;
    }

    public static IServiceCollection AddServices(this IServiceCollection services)
    {
        services.AddTransient<IUserResolver, UserResolver>();
        return services;
    }

    private static ILogger GetGlobalLogger(IConfiguration configuration)
    {
        var appDataFolderPath = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);

        FileUtils.CheckIfNotExistsCreate(appDataFolderPath + "/logs");
        FileUtils.CheckIfNotExistsCreate("logs");
        Environment.SetEnvironmentVariable("LOG_DIR", appDataFolderPath + "/logs");

        var logger = new LoggerConfiguration()
            .ReadFrom.Configuration(configuration);

        Log.Logger = logger.CreateLogger();

        return Log.Logger;
    }
}