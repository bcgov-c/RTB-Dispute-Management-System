using DataWarehouseReporting.GraphQL.Resolvers;
using DataWarehouseReporting.GraphQL.Types;
using GraphQL.Types;
using Microsoft.Extensions.DependencyInjection;

namespace DataWarehouseReporting.GraphQL.Infrastructure;

public static class GraphQlExtension
{
    public static IServiceCollection AddDependencies(this IServiceCollection services)
    {
        services.AddScoped<GraphQlQuery>();
        services.AddScoped<GraphQlMutation>();
        services.AddScoped<ISchema, DataWarehouseReportingSchema>();

        services.AddScoped<DimCityQueryResolver>();
        services.AddScoped<DimTimeQueryResolver>();
        services.AddScoped<FactDisputeSummaryQueryResolver>();
        services.AddScoped<FactHearingSummaryQueryResolver>();
        services.AddScoped<FactTimeStatisticQueryResolver>();
        services.AddScoped<LoadingHistoryQueryResolver>();

        services.AddScoped<SettingsType>();

        services.AddScoped<DimCityType>();
        services.AddScoped<DimTimeType>();
        services.AddScoped<FactDisputeSummaryType>();
        services.AddScoped<FactHearingSummaryType>();
        services.AddScoped<FactTimeStatisticType>();
        services.AddScoped<LoadingHistoryType>();

        services.AddScoped<DisputeCreationMethodEnum>();
        services.AddScoped<DisputeSubTypeEnum>();
        services.AddScoped<DisputeUrgencyEnum>();
        services.AddScoped<DisputeTypeEnum>();
        services.AddScoped<MigrationSourceOfTruthEnum>();
        services.AddScoped<PaymentMethodEnum>();
        services.AddScoped<DisputeStageEnum>();
        services.AddScoped<DisputeStatusesEnum>();
        services.AddScoped<DisputeProcessEnum>();

        return services;
    }
}