using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.Services.DataWarehouse.DataWarehouseDataModel;
using CM.Services.DataWarehouse.DataWarehouseRepository.FactTimeStatistic;
using CM.Services.DataWarehouse.DataWarehouseRepository.UnitOfWork;
using CM.Services.DataWarehouse.FactTimeStatistics.IntegrationEvents.EventHandling;
using CM.UserResolverService;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CM.Services.DataWarehouse.FactTimeStatistics
{
    public static class CustomExtensionsMethods
    {
        public static IServiceCollection AddRepositories(this IServiceCollection services)
        {
            services.AddTransient<IUnitOfWorkDataWarehouse, UnitOfWorkDataWarehouse>();
            services.AddTransient<IUnitOfWork, UnitOfWork>();
            services.AddTransient<IFactTimeStatisticRepository, FactTimeStatisticRepository>();

            return services;
        }

        public static IServiceCollection AddCustomDbContext(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionStringDw = configuration.GetConnectionString("DwConnection");
            var connectionString = configuration.GetConnectionString("DbConnection");
            services.AddEntityFrameworkNpgsql()
                .AddDbContext<DataWarehouseContext>(c => c.UseNpgsql(connectionStringDw, b => b.MigrationsAssembly("CM.Services.DataWarehouse.DataWarehouseDataModel")), ServiceLifetime.Transient);

            services.AddEntityFrameworkNpgsql()
                .AddDbContext<CaseManagementContext>(c => c.UseNpgsql(connectionString, b => b.MigrationsAssembly("CM.Data.Model")), ServiceLifetime.Transient);

            return services;
        }

        public static IServiceCollection AddCustomIntegrations(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services.AddSingleton<IUserResolver, UserResolver>();

            services.AddTransient<FactTimeStatisticsIntegrationEventHandler, FactTimeStatisticsIntegrationEventHandler>();

            return services;
        }
    }
}
