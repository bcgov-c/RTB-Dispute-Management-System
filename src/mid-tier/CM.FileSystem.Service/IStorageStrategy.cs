using System.Threading.Tasks;
using CM.Business.Services.SystemSettingsService;

namespace CM.FileSystem.Service;

public interface IStorageStrategy
{
    Task<string> StorageRootFolderAsync { get; }

    Task<string> TempFileRootAsync { get; }

    ISystemSettingsService SystemSettingsService { get; }
}