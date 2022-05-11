using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Security.Authentication;
using CM.Common.Utilities;
using CM.Messages;
using CM.Messages.PollyHandler;
using EasyNetQ;
using EasyNetQ.ConnectionString;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using Newtonsoft.Json;
using RabbitMQ.Client;
using Serilog;

namespace CM.ServiceBase;

public static class CustomExtensionsBase
{
    public static IHostBuilder CreateHostBuilder<TStartup>(string[] args)
        where TStartup : class
    {
        var config = GetWebHostDefaultsConfiguration();

        var host = Host
            .CreateDefaultBuilder(args)
            .ConfigureWebHostDefaults(webBuilder =>
            {
                webBuilder
                    .ConfigureKestrel(_ => { })
                    .UseConfiguration(config) //// Important, preserve that
                    .UseStartup<TStartup>()
                    .UseIIS();
            });

        host.UseSerilog();

        return host;
    }

    public static IConfigurationBuilder GetConfigurationBuilder(this IWebHostEnvironment hostingEnvironment)
    {
        var sharedFolder = Path.Combine(hostingEnvironment.ContentRootPath, "..", "shared");
        var sharedFile = Path.Combine(sharedFolder, "appsettings.json");

        return new ConfigurationBuilder()
            .SetBasePath(hostingEnvironment.ContentRootPath)
            .AddJsonFile("appsettings.json", false, true)
            .AddJsonFile(sharedFile, true, true)
            .AddJsonFile("secrets/appsettings.json", true)
            .AddJsonFile("secrets/identity_data_seed.json", true)
            .AddJsonFile("secrets/admin_data_seed.json", true)
            .AddEnvironmentVariables();
    }

    public static IServiceCollection AddSwagger(this IServiceCollection services, IConfiguration configuration, string title)
    {
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo());
        });

        services.AddSwaggerGenNewtonsoftSupport();

        return services;
    }

    public static IServiceCollection AddCustomMvc(this IServiceCollection services)
    {
        return services;
    }

    public static IApplicationBuilder UseDataBaseMigrations<TContext>(this IApplicationBuilder app, IConfiguration configuration)
        where TContext : DbContext
    {
        var serviceScopeFactory = app.ApplicationServices.GetService<IServiceScopeFactory>();

        using var serviceScope = serviceScopeFactory?.CreateScope();

        if (serviceScope != null)
        {
            var context = serviceScope.ServiceProvider.GetRequiredService<TContext>();
            if (configuration.IsTesting())
            {
                context.Database.EnsureDeleted();
                Log.Information("Test DB dropped");
            }

            context.Database.Migrate();

            Log.Information("Migrations finished");
        }
        else
        {
            Log.Information("Could not create service scope");
        }

        return app;
    }

    public static IServiceCollection AddLogger(this IServiceCollection services, IConfiguration configuration)
    {
        var logger = GetGlobalLogger(configuration);
        services.AddSingleton(logger);

        return services;
    }

    public static IServiceCollection AddEventBus(this IServiceCollection services, IConfiguration configuration, int retryCount = 0)
    {
        if (configuration.GetSection("MQTLS").Exists())
        {
            var cf = new ConnectionConfiguration
            {
                Hosts = new List<HostConfiguration>
                {
                    new()
                    {
                        Host = configuration["MQTLS:Host"],
                        Port = 5671
                    }
                },
                VirtualHost = configuration["MQTLS:VirtualHost"],
                AuthMechanisms = new IAuthMechanismFactory[] { new ExternalMechanismFactory() },
                Ssl =
                {
                    Enabled = true,
                    ServerName = System.Net.Dns.GetHostName(),
                    CertPath = configuration["MQTLS:CertPath"],
                    CertPassphrase = configuration["MQTLS:CertPassphrase"],
                    Version = SslProtocols.Tls12
                },
                PublisherConfirms = true
            };

            services.RegisterEasyNetQ(
                _ => cf,
                registerServices => registerServices.UseMessageWaitAndRetryHandlerPolicy(retryCount));
        }
        else
        {
            services.RegisterEasyNetQ(
                configuration["MQ:Cluster"],
                registerServices => registerServices.UseMessageWaitAndRetryHandlerPolicy(retryCount));
        }

        return services;
    }

    public static IServiceCollection AddHealthChecks(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddHealthChecks();
        return services;
    }

    public static bool IsTesting(this IConfiguration configuration)
    {
        var actionType = configuration?.GetValue<string>("Testing");

        return actionType is "True";
    }

    public static string GetAmqpString(this ConnectionStringParser parser, string easyNetQConnectionString)
    {
        var conn = GetAmqpConnection(easyNetQConnectionString);
        var host = conn.Hosts.FirstOrDefault();

        Debug.Assert(host != null, nameof(host) + " != null");
        return $"amqp://{conn.UserName}:{conn.Password}@{host.Host}:{conn.Port}/{conn.VirtualHost}";
    }

    public static ConnectionConfiguration GetAmqpConnection(string easyNetQConnectionString)
    {
        var connectionParser = new ConnectionStringParser();
        return connectionParser.Parse(easyNetQConnectionString);
    }

    public static void EventMessage(this ILogger logger, string message, BaseMessage messageObject)
    {
        var messageJson = JsonConvert.SerializeObject(messageObject);
        logger.Information("{Message} {MessageJson}", message, messageJson);
    }

    public static void EventMessageException(this ILogger logger, Exception exception, string message, BaseMessage messageObject)
    {
        var messageJson = JsonConvert.SerializeObject(messageObject);
        logger.Error(exception, "{Message} {MessageJson}", message, messageJson);
    }

    private static IConfigurationRoot GetWebHostDefaultsConfiguration()
    {
        return new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("secrets/hosting.json", true)
            .Build();
    }

    private static ILogger GetGlobalLogger(IConfiguration configuration)
    {
        var appDataFolderPath = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);

        FileUtils.CheckIfNotExistsCreate(appDataFolderPath + "/logs");
        FileUtils.CheckIfNotExistsCreate("logs");
        Environment.SetEnvironmentVariable("LOG_DIR", appDataFolderPath + "/logs");

        var logger = new LoggerConfiguration()
            .ReadFrom
            .Configuration(configuration);

        Log.Logger = logger.CreateLogger();
        return Log.Logger;
    }
}