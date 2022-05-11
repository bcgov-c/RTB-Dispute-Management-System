using CM.Messages;
using CM.ServiceBase;
using CM.Services.DataWarehouse.DataWarehouseDataModel;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Serilog;
using Swashbuckle.AspNetCore.SwaggerUI;

namespace CM.Services.DataWarehouse.FactTimeStatistics
{
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
                .AddSwagger(Configuration, "Data Warehouse Service")
                .AddEventBus(Configuration);
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddSerilog();

            using (var serviceScope = app.ApplicationServices.GetService<IServiceScopeFactory>().CreateScope())
            {
                Log.Information("DB connection string {0}", Configuration.GetConnectionString("DwConnection"));

                var context = serviceScope.ServiceProvider.GetRequiredService<DataWarehouseContext>();
                context.Database.Migrate();
            }

            app.UseRouting();
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.DocExpansion(DocExpansion.None);
                c.SwaggerEndpoint("../swagger/v1/swagger.json", "Data Warehouse API V1");
            });

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseHsts();
            }

            app.UseAutoSubscribe("DataWarehouse", GetType().Assembly);
            app.UseHealthChecks("/check");
        }
    }
}
