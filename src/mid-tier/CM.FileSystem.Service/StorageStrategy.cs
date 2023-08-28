using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Services.SystemSettingsService;

namespace CM.FileSystem.Service;

public abstract class StorageStrategy : IStorageStrategy
{
    public StorageStrategy(ISystemSettingsService systemSettingsService)
    {
        SystemSettingsService = systemSettingsService;

        var list = SystemSettingsService.GetValueAsync<string>("WhitelistedExtensions").Result;
        WhitelistedExtensions = new List<string>();
        WhitelistedExtensions.AddRange(list.Split(' '));
    }

    public ISystemSettingsService SystemSettingsService { get; }

    public abstract Task<string> StorageRootFolderAsync { get; }

    public abstract Task<string> TempFileRootAsync { get; }

    public List<string> WhitelistedExtensions { get; }
}