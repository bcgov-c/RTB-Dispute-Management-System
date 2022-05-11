using System.Threading.Tasks;

namespace CM.Business.Services.ColdStorage;

public interface IColdStorageMigrationService
{
    Task<bool> MigrateFilesToColdStorage();

    Task<bool> CleanUpEmptyDirectories();
}