using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Services.SystemSettingsService;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using Polly;
using Serilog;
using File = System.IO.File;

namespace CM.Business.Services.ColdStorage;

public class ColdStorageMigrationMigrationService : CmServiceBase, IColdStorageMigrationService
{
    public ColdStorageMigrationMigrationService(IMapper mapper, IUnitOfWork unitOfWork, ISystemSettingsService systemSettingsService, ILogger logger)
        : base(unitOfWork, mapper)
    {
        SystemSettingsService = systemSettingsService;
        Logger = logger;
    }

    private ILogger Logger { get; }

    private ISystemSettingsService SystemSettingsService { get; }

    public async Task<bool> MigrateFilesToColdStorage()
    {
        var coldStorageEnabled = await SystemSettingsService.GetValueAsync<bool>(SettingKeys.ColdStorageEnabled);

        if (coldStorageEnabled == false)
        {
            return false;
        }

        var closedDaysForColdStorage = await SystemSettingsService.GetValueAsync<int>(SettingKeys.ClosedDaysForColdStorage);
        var fileStorageRoot = await SystemSettingsService.GetValueAsync<string>(SettingKeys.FileStorageRoot);
        var fileColdStorageRoot = await SystemSettingsService.GetValueAsync<string>(SettingKeys.FileColdStorageRoot);

        var disputeForColdStorageMigrationStatuses = await UnitOfWork.DisputeStatusRepository.GetDisputeForColdStorageMigrationStatuses(closedDaysForColdStorage);

        foreach (var item in disputeForColdStorageMigrationStatuses)
        {
            await MigrateDisputeFilesToColdStorage(item, fileStorageRoot, fileColdStorageRoot);
        }

        return true;
    }

    public async Task<bool> CleanUpEmptyDirectories()
    {
        var fileStorageRoot = await SystemSettingsService.GetValueAsync<string>(SettingKeys.FileStorageRoot);

        FileUtils.DeleteEmptySubdirectories(fileStorageRoot);

        return true;
    }

    private async System.Threading.Tasks.Task MigrateDisputeFilesToColdStorage(DisputeStatus disputeStatus, string fileStorageRoot, string fileColdStorageRoot)
    {
        var files = await UnitOfWork.FileRepository.GetDisputeFiles(disputeStatus.DisputeGuid);

        try
        {
            var fileToMigrateList = new List<string>();

            foreach (var item in files)
            {
                var fileToMigrate = Path.Combine(fileStorageRoot, item.FilePath);
                var fileColdPath = Path.Combine(fileColdStorageRoot, item.FilePath);

                var fileInfo = new FileInfo(fileToMigrate);
                if (fileInfo.Exists == false || fileInfo.Length == 0)
                {
                    item.IsDeleted = true;
                    item.FileStatus = FileStatus.Invalid;
                    UnitOfWork.FileRepository.Update(item);

                    if (fileInfo.Exists && fileInfo.Length == 0)
                    {
                        fileInfo.Delete();
                    }

                    continue;
                }

                FileUtils.CheckIfNotExistsCreate(Path.GetDirectoryName(fileColdPath));

                if (File.Exists(fileColdPath))
                {
                    Logger.Information("Deleting {FileColdPath}", fileColdPath);
                    File.Delete(fileColdPath);
                }

                Logger.Information("Coping {FileToMigrate} to cold storage {FileColdPath}", fileToMigrate, fileColdPath);

                Policy
                    .Handle<IOException>()
                    .Or<UnauthorizedAccessException>()
                    .WaitAndRetry(3, count => TimeSpan.FromMilliseconds(count * 100))
                    .Execute(() =>
                    {
                        File.Copy(fileToMigrate, fileColdPath);
                    });

                var thumbFilePathToMigrate = GetFileThumbnailPath(item.FilePath);

                if (thumbFilePathToMigrate != null)
                {
                    var thumbnailToMigrate = Path.Combine(fileStorageRoot, thumbFilePathToMigrate);
                    var thumbnailColdPath = Path.Combine(fileColdStorageRoot, thumbFilePathToMigrate);

                    if (File.Exists(thumbnailToMigrate))
                    {
                        if (File.Exists(thumbnailColdPath))
                        {
                            Logger.Information("Deleting {ThumbnailColdPath}", thumbnailColdPath);
                            File.Delete(thumbnailColdPath);
                        }

                        Logger.Information("Coping {ThumbnailToMigrate} to cold storage {ThumbnailColdPath}", thumbnailToMigrate, thumbnailColdPath);
                        Policy
                            .Handle<IOException>()
                            .Or<UnauthorizedAccessException>()
                            .WaitAndRetry(3, count => TimeSpan.FromMilliseconds(count * 100))
                            .Execute(() =>
                            {
                                File.Copy(thumbnailToMigrate, thumbnailColdPath);
                            });

                        fileToMigrateList.Add(thumbnailToMigrate);
                    }
                }

                fileToMigrateList.Add(fileToMigrate);
                item.Storage = StorageType.FileCold;
                UnitOfWork.FileRepository.Update(item);
            }

            var dispute = await UnitOfWork.DisputeRepository.GetDisputeByGuidAsync(disputeStatus.DisputeGuid);
            dispute.FilesStorageSetting = DisputeStorageType.Cold;
            UnitOfWork.DisputeRepository.Update(dispute);

            await UnitOfWork.Complete(true);

            foreach (var item in fileToMigrateList)
            {
                File.Delete(item);
            }

            Logger.Information("Migrating Dispute {DisputeGuid} to cold storage completed. {FileToMigrateListCount} files migrated", disputeStatus.DisputeGuid, fileToMigrateList.Count);
        }
        catch (Exception exception)
        {
            Logger.Error(exception, "Error migrating Dispute {DisputeGuid}", disputeStatus.DisputeGuid);
        }
    }

    private string GetFileThumbnailPath(string filePath)
    {
        var thumbFileName = string.Format(ThumbnailHelper.FilePattern, Path.GetFileName(filePath));
        var thumbFileDirName = Path.GetDirectoryName(filePath);

        if (thumbFileDirName != null)
        {
            return Path.Combine(thumbFileDirName, thumbFileName);
        }

        return null;
    }
}