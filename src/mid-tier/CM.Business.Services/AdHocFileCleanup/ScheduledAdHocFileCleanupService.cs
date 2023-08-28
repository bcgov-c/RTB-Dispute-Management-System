using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using CM.Business.Services.Files;
using CM.Business.Services.SystemSettingsService;
using CM.Common.Database;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Model.AdHocFile;
using CM.Data.Repositories.UnitOfWork;
using CM.FileSystem.Service;
using Serilog;
using SystemTask = System.Threading.Tasks.Task;

namespace CM.Business.Services.AdHocFileCleanup;

public class ScheduledAdHocFileCleanupService : CmServiceBase, IScheduledAdHocFileCleanupService
{
    private readonly ILogger _logger;
    private readonly IFileService _fileService;
    private readonly ISystemSettingsService _systemSettingsService;
    private readonly CaseManagementContext _caseManagementContext;

    public ScheduledAdHocFileCleanupService(
        CaseManagementContext caseManagementContext,
        IFileService fileService,
        ISystemSettingsService systemSettingsService,
        IMapper mapper,
        IUnitOfWork unitOfWork,
        ILogger logger)
        : base(unitOfWork, mapper)
    {
        _logger = logger;
        _fileService = fileService;
        _systemSettingsService = systemSettingsService;
        _caseManagementContext = caseManagementContext;
    }

    public async SystemTask RunAdHocFileCleanup(Data.Model.AdHocFile.AdHocFileCleanup adHocFileCleanup)
    {
        if (adHocFileCleanup.IsActive == false)
        {
            _logger.Warning("Task is not active. Skipping");
            return;
        }

        if (string.IsNullOrWhiteSpace(adHocFileCleanup.QueryForCleanup))
        {
            _logger.Warning("QueryForCleanup should not be empty");
            return;
        }

        List<dynamic> items = null;
        try
        {
            items = _caseManagementContext
                .CollectionFromSql(adHocFileCleanup.QueryForCleanup, null)
                .ToList();
        }
        catch (Exception e)
        {
            _logger.Error(e, "Error executing AdHocFileCleanup query {Query} for id: {Id}", adHocFileCleanup.QueryForCleanup, adHocFileCleanup.AdHocFileCleanupId);
        }

        var adhocFileCleanupTracking = new AdHocFileCleanupTracking
        {
            AdHocFileCleanupId = adHocFileCleanup.AdHocFileCleanupId,
            StartTime = DateTime.UtcNow,
            Status = FileCleanupStatus.Started,
            Count = 0,
            Size = 0
        };

        long cumulativeFileSize = 0;
        var count = 0;

        _caseManagementContext.AdHocFileCleanupTracking.Add(adhocFileCleanupTracking);
        await _caseManagementContext.SaveChangesAsync();

        adhocFileCleanupTracking.Status = FileCleanupStatus.Succeeded;
        if (items is not null)
        {
            foreach (var item in items)
            {
                try
                {
                    FileCleanup fileItem = ExpandoMapper.FromExpando<FileCleanup>(item);
                    var fileInfo = await _fileService.GetAsync(fileItem.FileGuid, true);
                    if (fileInfo == null)
                    {
                        continue;
                    }

                    if (fileInfo.IsDeleted != true)
                    {
                        _logger.Error("{FileGuid} file cannot be deleted, because it's not marked as IsDeleted", fileItem.FileGuid);
                        continue;
                    }

                    var fileContext = FileContextFactory.GetStorageFromFileStorageType(fileInfo.Storage, _systemSettingsService);
                    var exists = await fileContext.IsExists(fileInfo);
                    if (exists)
                    {
                        await fileContext.Delete(fileInfo);
                        await fileContext.DeleteThumbnail(fileInfo);
                        await _fileService.SoftDelete(fileInfo.FileId);
                        cumulativeFileSize += fileInfo.FileSize;
                        count += 1;
                    }
                    else
                    {
                        adhocFileCleanupTracking.Status = FileCleanupStatus.Failed;
                        _logger.Error(@"Physical file does not exist {FileInfo}", fileInfo.FileGuid);
                    }
                }
                catch (Exception e)
                {
                    adhocFileCleanupTracking.Status = FileCleanupStatus.Failed;
                    _logger.Error(e, "Error processing AdHocFileCleanup");
                }
            }
        }

        adhocFileCleanupTracking.Count = count;
        adhocFileCleanupTracking.Size = FileUtils.ConvertBytesToMegabytes(cumulativeFileSize);

        _caseManagementContext.AdHocFileCleanupTracking.Update(adhocFileCleanupTracking);
        await _caseManagementContext.SaveChangesAsync();
    }
}