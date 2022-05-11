using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.Services.DataWarehouse.DataWarehouseDataModel;
using CM.Services.DataWarehouse.DataWarehouseRepository.DimCity;
using CM.Services.DataWarehouse.DataWarehouseRepository.DimTime;
using CM.Services.DataWarehouse.DataWarehouseRepository.FactDisputeSummary;
using CM.Services.DataWarehouse.DataWarehouseRepository.LoadingHistory;
using CM.Services.DataWarehouse.DataWarehouseRepository.UnitOfWork;
using CM.Services.DataWarehouse.FactDisputeService.IntegrationEvents.EventHandling;
using CM.UserResolverService;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CM.Services.DataWarehouse.FactDisputeService;

public static class CustomExtensionsMethods
{
    public static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        services.AddTransient<IUnitOfWorkDataWarehouse, UnitOfWorkDataWarehouse>();
        services.AddTransient<IUnitOfWork, UnitOfWork>();
        services.AddTransient<IDimCityRepository, DimCityRepository>();
        services.AddTransient<IDimTimeRepository, DimTimeRepository>();
        services.AddTransient<IFactDisputeSummaryRepository, FactDisputeSummaryRepository>();
        services.AddTransient<ILoadingHistoryRepository, LoadingHistoryRepository>();

        return services;
    }

    public static IServiceCollection AddCustomDbContext(this IServiceCollection services, IConfiguration configuration)
    {
        // Postgres
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

        services.AddTransient<DataWarehouseIntegrationEventHandler, DataWarehouseIntegrationEventHandler>();
        services.AddTransient<FactTimeStatisticsIntegrationEventHandler, FactTimeStatisticsIntegrationEventHandler>();
        services.AddTransient<FactHearingSummaryIntegrationEventHandler, FactHearingSummaryIntegrationEventHandler>();
        services.AddTransient<FactIntakeProcessingIntegrationEventHandler, FactIntakeProcessingIntegrationEventHandler>();

        return services;
    }
}