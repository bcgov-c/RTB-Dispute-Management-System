using System;
using CM.Messages;
using CM.Messages.Pdf.Events;
using CM.ServiceBase;
using CM.Services.PdfConvertor.PdfService.IntegrationEvents.EventHandling;
using EasyNetQ;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Serilog;
using Swashbuckle.AspNetCore.SwaggerUI;

namespace CM.Services.PdfConvertor.PdfService;

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
            .AddCustomMvc()
            .AddSwagger(Configuration, "Pdf Service")
            .AddEventBus(Configuration)
            .AddHealthChecks(Configuration);
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
            c.SwaggerEndpoint("../swagger/v1/swagger.json", "Pdf Generator API V1");
        });

        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }
        else
        {
            app.UseHsts();
        }

        ConfigureResponds(app);
        app.UseHealthChecks("/check");
    }

    private static void ConfigureResponds(IApplicationBuilder app)
    {
        var bus = app.GetBus();

        bus.Rpc.Respond<PdfDocumentGenerateIntegrationEvent, PdfFileGeneratedIntegrationEvent>(PdfFileGenerateIntegrationEventHandler.ConsumeAsync);
    }
}