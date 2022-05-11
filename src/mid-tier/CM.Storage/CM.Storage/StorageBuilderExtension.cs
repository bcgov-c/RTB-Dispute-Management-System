using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CM.Storage
{
    public static class StorageBuilderExtension
    {
        public static IServiceCollection AddStorage(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddSingleton<IStorage, Storage>();
            return services;
        }
    }
}
