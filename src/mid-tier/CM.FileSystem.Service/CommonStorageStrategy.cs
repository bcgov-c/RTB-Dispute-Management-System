using System.Threading.Tasks;
using CM.Business.Services.SystemSettingsService;
using CM.Common.Utilities;

namespace CM.FileSystem.Service;

public class CommonStorageStrategy : StorageStrategy
{
    public CommonStorageStrategy(ISystemSettingsService systemSettingsService)
        : base(systemSettingsService)
    {
    }

    public override Task<string> StorageRootFolderAsync => SystemSettingsService.GetValueAsync<string>(SettingKeys.CommonFileStorageRoot);

    public override Task<string> TempFileRootAsync => SystemSettingsService.GetValueAsync<string>(SettingKeys.TempStorageRoot);
}