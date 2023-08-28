using System;
using CM.Common.Utilities;
using CM.ServiceBase;
using DataWarehouseReporting.GraphQL.Infrastructure;
using GraphQl.Extensions;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace DataWarehouseReporting.API;

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
        services.AddLogger(Configuration);

        services
            .AddOptions()
            .Configure<OpenIdConnectOptions>(Configuration.GetSection("OpenId"));

        services.AddCors(
            options => options.AddPolicy(
                "AllowCors",
                builder =>
                {
                    builder
                        .AllowCredentials()
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .WithExposedHeaders("Token", "Content-Type", "Authorization");
                }));

        services
            .AddAutoMapper(typeof(Startup))
            .AddControllersWithViews(opt =>
            {
                opt.UseCentralRoutePrefix(new RouteAttribute(Configuration.GetServiceRoutePrefix()));
            })

            .AddNewtonsoftJson();

        services
            .AddHttpContextAccessor()
            .AddOidAuthentication(Configuration)
            .AddGraphQl(Configuration)
            .AddDb(Configuration)
            .AddServices()
            .AddHealthChecks(Configuration)
            .AddDependencies();
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }

        app.UseRouting();
        app.UseCors(options => options.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin());
        app.UseAuthentication();
        app.UseAuthorization();

        app.UseGraphQlWithAuth();
        app.UseDefaultFiles();
        app.UseStaticFiles();

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
        });

        app.UseHealthChecks("/check");
    }
}