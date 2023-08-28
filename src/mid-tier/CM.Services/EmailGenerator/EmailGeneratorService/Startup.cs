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

namespace CM.Services.EmailGenerator.EmailGeneratorService;

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
            .AddLogger(Configuration)
            .AddRepositories()
            .AddCustomIntegrations(Configuration)
            .AddCustomMvc()
            .AddHealthChecks(Configuration)
            .AddCustomDbContext(Configuration)
            .AddSwagger(Configuration, "Email Generator Service")
            .AddEventBus(Configuration);
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ILoggerFactory loggerFactory)
    {
        AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

        loggerFactory.AddSerilog();

        app.UseRouting();
        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.DocExpansion(DocExpansion.None);
            c.SwaggerEndpoint("../swagger/v1/swagger.json", "Email Generator API V1");
        });

        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }
        else
        {
            app.UseHsts();
        }

        app.UseAutoSubscribe("EmailGeneration", GetType().Assembly);
        app.UseHealthChecks("/check");
    }
}