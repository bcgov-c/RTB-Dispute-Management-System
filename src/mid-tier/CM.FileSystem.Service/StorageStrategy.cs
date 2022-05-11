using System.Threading.Tasks;
using CM.Business.Services.SystemSettingsService;

namespace CM.FileSystem.Service;

public abstract class StorageStrategy : IStorageStrategy
{
    public StorageStrategy(ISystemSettingsService systemSettingsService)
    {
        SystemSettingsService = systemSettingsService;
    }

    public ISystemSettingsService SystemSettingsService { get; }

    public abstract Task<string> StorageRootFolderAsync { get; }

    public abstract Task<string> TempFileRootAsync { get; }
}