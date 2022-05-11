using System;
using CM.Business.Services.SystemSettingsService;
using CM.Common.Utilities;

namespace CM.FileSystem.Service;

public class FileContextFactory
{
    public static FileContext GetStorageFromDisputeStorageType(DisputeStorageType disputeStorageType,
        ISystemSettingsService systemSettingsService)
    {
        IStorageStrategy storageStrategy = disputeStorageType switch
        {
            DisputeStorageType.Hot => new HotStorageStrategy(systemSettingsService),
            DisputeStorageType.Cold => new ColdStorageStrategy(systemSettingsService),
            _ => null
        };

        return new FileContext(storageStrategy);
    }

    public static FileContext GetStorageFromFileStorageType(StorageType storageType,
        ISystemSettingsService systemSettingsService)
    {
        IStorageStrategy storageStrategy = storageType switch
        {
            StorageType.File => new HotStorageStrategy(systemSettingsService),
            StorageType.FileCold => new ColdStorageStrategy(systemSettingsService),
            _ => null
        };

        return new FileContext(storageStrategy);
    }

    public static FileContext GetCommonStorageFromFileStorageType(StorageType storageType,
        ISystemSettingsService systemSettingsService)
    {
        IStorageStrategy storageStrategy = storageType switch
        {
            StorageType.File => new CommonStorageStrategy(systemSettingsService),
            StorageType.FileCold => throw new NotSupportedException(
                "Common files cannot be associated to cold storage"),
            _ => null
        };

        return new FileContext(storageStrategy);
    }

    public static FileContext GetExternalStorageFromFileStorageType(StorageType storageType,
        ISystemSettingsService systemSettingsService)
    {
        IStorageStrategy storageStrategy = storageType switch
        {
            StorageType.File => new ExternalStorageStrategy(systemSettingsService),
            StorageType.FileCold => throw new NotSupportedException(
                "External files cannot be associated to cold storage"),
            _ => null
        };

        return new FileContext(storageStrategy);
    }
}