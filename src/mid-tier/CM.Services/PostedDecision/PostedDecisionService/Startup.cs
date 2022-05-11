using System;
using CM.Common.Utilities;
using CM.ElasticSearch;
using CM.Messages;
using CM.ServiceBase;
using CM.Services.PostedDecision.PostedDecisionDataService.Configuration;
using CM.Services.PostedDecision.PostedDecisionDataService.Entities;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Swashbuckle.AspNetCore.SwaggerUI;

namespace CM.Services.PostedDecision.PostedDecisionDataService;

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
        services.AddOptions();
        services.Configure<FileSettings>(Configuration.GetSection("Settings"));

        services
            .AddControllers(opt =>
            {
                opt.UseCentralRoutePrefix(new RouteAttribute(Configuration.GetServiceRoutePrefix()));
            })
            .AddNewtonsoftJson();
        services
            .AddLogger(Configuration)
            .AddMapper(Configuration)
            .AddCustomIntegrations(Configuration)
            .AddCustomCors(Configuration)
            .AddCustomMvc()
            .AddHealthChecks(Configuration)
            .AddCustomDbContext(Configuration)
            .AddSwagger(Configuration, "Posted Decision Service")
            .AddEventBus(Configuration);

        services.AddElasticsearch<PostedDecisionIndex>(Configuration);
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }

        app.UseRouting();
        app.UseCors("AllowCors");
        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
        });

        app.UseDataBaseMigrations<PostedDecisionContext>(Configuration);

        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.DocExpansion(DocExpansion.None);
            c.SwaggerEndpoint("../swagger/v1/swagger.json", "Posted Decision API V1");
        });

        app.UseAutoSubscribe("PostedDecisionService", GetType().Assembly);
        app.UseHealthChecks("/check");
    }
}