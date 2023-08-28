using System;
using System.Collections.Generic;
using System.Net;
using CM.Business.Services.Mapping;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.ServiceBase;
using CM.WebAPI.Filters;
using CM.WebAPI.WebApiHelpers.CustomHealthChecks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;

namespace CM.WebAPI;

public static partial class CustomExtensionsMethods
{
    public static IServiceCollection AddMapper(this IServiceCollection services, IConfiguration configuration)
    {
        if (configuration.IsTesting() == false)
        {
            services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
        }
        else
        {
            services.AddSingleton(MappingProfile.Init());
        }

        return services;
    }

    public static IServiceCollection AddCustomDbContext(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DbConnection");
        services.AddEntityFrameworkNpgsql()
            .AddDbContext<CaseManagementContext>(
                options => options
                    .UseNpgsql(connectionString, b => b.MigrationsAssembly("CM.Data.Model")));

        return services;
    }

    public static IServiceCollection AddCustomSwagger(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo());
            c.SchemaFilter<SwaggerExcludeFilter>();

            c.AddSecurityDefinition("Token", new OpenApiSecurityScheme
            {
                Description = "Enter your token in the text input below.\r\n\r\nExample: \"MyToken\"",
                Name = "Token",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.ApiKey,
                Scheme = "Token"
            });

            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Token"
                        },
                        Scheme = "custom",
                        Name = "Token",
                        In = ParameterLocation.Header
                    },
                    new List<string>()
                }
            });
        });

        services.ConfigureSwaggerGen(options =>
        {
            options.OperationFilter<DisputeGuidHeaderParameterOperationFilter>();
            options.OperationFilter<ConcurrencyCheckHeaderParameter>();
            options.OperationFilter<FileOperationFilter>();
        });

        services.AddSwaggerGenNewtonsoftSupport();
        return services;
    }

    public static IServiceCollection AddCustomCors(this IServiceCollection services, IConfiguration configuration)
    {
        var origins = configuration.GetSection("Cors:AllowedOriginList");

        services.AddCors(
            options => options.AddPolicy(
                "AllowCors",
                builder =>
                {
                    builder
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .WithExposedHeaders(ApiHeader.Token, "Content-Type", ApiHeader.Authorization);

                    if (origins.Exists())
                    {
                        builder.WithOrigins(origins.Get<string[]>());
                    }
                    else
                    {
                        builder.AllowAnyOrigin();
                    }
                }));

        return services;
    }

    public static IServiceCollection AddAntiForgery(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddAntiforgery(options =>
        {
            options.HeaderName = ApiHeader.XCsrfToken;
        });

        return services;
    }

    public static IServiceCollection AddHealthChecks(this IServiceCollection services, IConfiguration configuration)
    {
        var hcBuilder = services
            .AddHealthChecks();

        if (configuration.GetSection("HealthServices").Exists())
        {
            hcBuilder
                .AddNpgSql(configuration.GetConnectionString("DbConnection"))
                .AddWorkingSetHealthCheck(HealthCheckConfiguration.MaxMemory)
                .AddPrivateMemoryHealthCheck(HealthCheckConfiguration.MaxMemory)
                .AddCheck<ThumbnailHealthCheck>("Thumbnail")
                .AddCheck<FfmpegHealthCheck>("Ffmpeg")
                .AddCheck<FileStorageHealthCheck>("FileStorage")
                .AddUrlGroup(configuration.GetServiceHealth(ServiceNames.ReconciliationReportGenerator), ServiceNames.ReconciliationReportGenerator)
                .AddUrlGroup(configuration.GetServiceHealth(ServiceNames.ReconciliationReportSender), ServiceNames.ReconciliationReportSender)
                .AddUrlGroup(configuration.GetServiceHealth(ServiceNames.Pdf), ServiceNames.Pdf)
                .AddUrlGroup(configuration.GetServiceHealth(ServiceNames.AdHocReport), ServiceNames.AdHocReport)
                .AddUrlGroup(configuration.GetServiceHealth(ServiceNames.EmailGenerator), ServiceNames.EmailGenerator)
                .AddUrlGroup(configuration.GetServiceHealth(ServiceNames.EmailNotification), ServiceNames.EmailNotification)
                .AddUrlGroup(configuration.GetServiceHealth(ServiceNames.PostedDecision), ServiceNames.PostedDecision)
                .AddUrlGroup(configuration.GetServiceHealth(ServiceNames.PostedDecisionDataCollection), ServiceNames.PostedDecisionDataCollection)
                .AddUrlGroup(configuration.GetServiceHealth(ServiceNames.DataWarehouseService), ServiceNames.DataWarehouseService)
                .AddUrlGroup(configuration.GetServiceHealth(ServiceNames.DataWarehouseReport), ServiceNames.DataWarehouseReport);

            services
                .AddHealthChecksUI(options =>
                {
                    options.AddHealthCheckEndpoint(
                        "Case Management Monitoring Dashboard",
                        configuration.GetServiceHealth(ServiceNames.MidTier).AbsoluteUri);
                })
                .AddInMemoryStorage();
        }

        return services;
    }

    public static IServiceCollection AddCustomInitializers(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<FormOptions>(o =>
        {
            o.ValueLengthLimit = int.MaxValue;
            o.MultipartBodyLengthLimit = int.MaxValue;
            o.MemoryBufferThreshold = int.MaxValue;
        });

        return services;
    }

    public static void UseForwardHeaders(this IApplicationBuilder app, IConfiguration configuration)
    {
        if (configuration.GetSection("ForwardProxies").Exists())
        {
            var options = new ForwardedHeadersOptions
            {
                ForwardedHeaders = ForwardedHeaders.All,
                RequireHeaderSymmetry = false,
                ForwardLimit = null
            };

            var proxyIp = configuration["ForwardProxies:IP"];
            options.KnownProxies.Add(IPAddress.Parse(proxyIp));

            app.UseForwardedHeaders(options);
        }
    }
}