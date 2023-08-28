using System;
using CM.Messages;
using CM.ServiceBase;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Serilog;
using Swashbuckle.AspNetCore.SwaggerUI;

namespace CM.Services.EmailNotification.EmailNotificationService;

public class Startup
{
    public Startup(IConfiguration configuration, IWebHostEnvironment hostingEnvironment)
    {
        Configuration = configuration;
        var builder = hostingEnvironment.GetConfigurationBuilder();
        Configuration = builder.Build();
    }

    private IConfiguration Configuration { get; }

    public void ConfigureServices(IServiceCollection services)
    {
        services.AddControllers().AddNewtonsoftJson();
        services
            .AddMapper(Configuration)
            .AddLogger(Configuration)
            .AddRepositories()
            .AddCustomIntegrations(Configuration)
            .AddCustomMvc()
            .AddHealthChecks(Configuration)
            .AddCustomDbContext(Configuration)
            .AddSwagger(Configuration, "Email Notification Service")
            .AddEventBus(Configuration, 3);
    }

    // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
    public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ILoggerFactory loggerFactory)
    {
        AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
        loggerFactory.AddSerilog();

        app.UseRouting();
        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.DocExpansion(DocExpansion.None);
            c.SwaggerEndpoint("../swagger/v1/swagger.json", "Email Notification Service API V1");
        });

        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }
        else
        {
            app.UseHsts();
        }

        app.UseAutoSubscribe("EmailNotification", GetType().Assembly);
        app.UseHealthChecks("/check");
    }
}