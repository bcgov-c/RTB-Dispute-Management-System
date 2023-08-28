using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Dispute;
using CM.Business.Entities.Models.Files;
using CM.Business.Services.IntegrationEvents.Pdf.EventHandling;
using CM.Business.Services.SystemSettingsService;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;
using EasyNetQ;
using CmFile = CM.Data.Model.File;

namespace CM.Business.Services.Files;

public class FileService : CmServiceBase, IFileService
{
    public FileService(IMapper mapper, IUnitOfWork unitOfWork, IBus bus, ISystemSettingsService systemSettingsService)
        : base(unitOfWork, mapper)
    {
        SystemSettingsService = systemSettingsService;
        Bus = bus;
    }

    private IBus Bus { get; }

    private ISystemSettingsService SystemSettingsService { get; }

    public async Task<Guid> ResolveDisputeGuid(int id)
    {
        var file = await UnitOfWork.FileRepository.GetNoTrackingByIdAsync(p => p.FileId == id);

        if (file != null)
        {
            return file.DisputeGuid;
        }

        return Guid.Empty;
    }

    public async Task<FileResponse> CreateAsync(DisputeResponse dispute, FileRequest fileRequest)
    {
        var newFile = MapperService.Map<FileRequest, CmFile>(fileRequest);
        newFile.DisputeGuid = dispute.DisputeGuid;
        newFile.IsDeleted = false;

        if (fileRequest.FileDate == null)
        {
            newFile.FileDate = DateTime.UtcNow;
        }

        if (fileRequest.FileDate != null && fileRequest.FileDate == DateTime.MinValue)
        {
            newFile.FileDate = DateTime.UtcNow;
        }

        var result = await UnitOfWork.FileRepository.InsertAsync(newFile);
        var completeResult = await UnitOfWork.Complete();
        completeResult.AssertSuccess();

        if (fileRequest.FileType == (byte)FileType.AnonymousExternalDocument || fileRequest.FileMimeType == FileMimeTypes.Pdf)
        {
            //// TODO: Run PostedDecisionService
        }

        var fileResponse = MapperService.Map<FileResponse>(result);

        fileResponse.FileUrl = await GetFileUrl(result);

        return fileResponse;
    }

    public async Task<FileResponse> CreateAsyncV2(DisputeResponse dispute, FileUploadInfo fileUploadInfo)
    {
        var newFile = MapperService.Map<FileUploadInfo, CmFile>(fileUploadInfo);
        newFile.DisputeGuid = dispute.DisputeGuid;
        newFile.IsDeleted = false;
        newFile.Storage = GetStorageType(dispute.FilesStorageSetting);

        if (fileUploadInfo.FileDate != null && fileUploadInfo.FileDate == DateTime.MinValue)
        {
            newFile.FileDate = DateTime.UtcNow;
        }

        var result = await UnitOfWork.FileRepository.InsertAsync(newFile);
        var completeResult = await UnitOfWork.Complete();
        completeResult.AssertSuccess();

        var fileResponse = MapperService.Map<FileResponse>(result);

        fileResponse.FileUrl = await GetFileUrl(result);

        return fileResponse;
    }

    public async Task<bool> DeleteAsync(int fileId)
    {
        var file = await UnitOfWork.FileRepository.GetByIdAsync(fileId);

        if (file == null)
        {
            return false;
        }

        file.IsDeleted = true;
        UnitOfWork.FileRepository.Attach(file);
        var result = await UnitOfWork.Complete();

        return result.CheckSuccess();
    }

    public async Task<FileResponse> GetAsync(Guid fileGuid, bool ignoreFilter = false)
    {
        var file = await UnitOfWork.FileRepository.GetNoTrackingByIdAsync(r => r.FileGuid.Equals(fileGuid), ignoreFilter);

        return file != null ? MapperService.Map<CmFile, FileResponse>(file) : null;
    }

    public async Task<FileResponse> GetAsync(int fileId)
    {
        var file = await UnitOfWork.FileRepository.GetByIdAsync(fileId);

        return file != null ? MapperService.Map<CmFile, FileResponse>(file) : null;
    }

    public async Task<FileInfoResponse> GetFileInfo(int fileId)
    {
        var fileInfo = await UnitOfWork.FileRepository.GetByIdAsync(fileId);

        if (fileInfo == null)
        {
            return null;
        }

        var response = MapperService.Map<CmFile, FileInfoResponse>(fileInfo);
        response.FileUrl = await GetFileUrl(fileInfo);

        return response;
    }

    public async Task<DisputeFileInfoResponse> GetDisputeFiles(Guid disputeGuid, FileInfoGetRequest request)
    {
        var result = await UnitOfWork.FileRepository.FindAllAsync(f => f.DisputeGuid == disputeGuid);
        var disputeFiles = await result.ToListAsync();

        if (request.FileTypes != null && request.FileTypes.Any())
        {
            disputeFiles = disputeFiles.Where(x => request.FileTypes.Contains(x.FileType)).ToList();
        }

        if (disputeFiles == null)
        {
            return null;
        }

        var fileInfoResponses = new List<FileInfoResponse>();

        foreach (var item in disputeFiles)
        {
            var fileInfoResponse = MapperService.Map<CmFile, FileInfoResponse>(item);
            fileInfoResponse.FileUrl = await GetFileUrl(item);
            fileInfoResponses.Add(fileInfoResponse);
        }

        var disputeFileResponse = new DisputeFileInfoResponse
        {
            TotalAvailableRecords = disputeFiles.Count,
            FileInfoResponses = fileInfoResponses
        };

        return disputeFileResponse;
    }

    public async Task<FileInfoPatchResponse> PatchFileInfo(CmFile file)
    {
        UnitOfWork.FileRepository.Attach(file);
        var result = await UnitOfWork.Complete();

        if (!result.CheckSuccess())
        {
            return null;
        }

        var fileInfoPatchResponse = MapperService.Map<CmFile, FileInfoPatchResponse>(file);
        fileInfoPatchResponse.FileUrl = await GetFileUrl(file);

        return fileInfoPatchResponse;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object fileId)
    {
        return await UnitOfWork.FileRepository.GetLastModifiedDateAsync((int)fileId);
    }

    public async Task<CmFile> GetNoTrackingFileAsync(int id)
    {
        return await UnitOfWork.FileRepository.GetNoTrackingByIdAsync(p => p.FileId == id);
    }

    public async Task<bool> CheckAddedBy(int fileId, int addedBy)
    {
        return await UnitOfWork.FileRepository.CheckAddedByExistence(fileId, addedBy);
    }

    public async Task<FileInfo> CreatePdf(DisputeResponse dispute, PdfFileRequest pdfFileRequest, DateTime createdDateTime)
    {
        var tempFolder = await SystemSettingsService.GetValueAsync<string>(SettingKeys.TempStorageRoot);

        var pageHeader = await SystemSettingsService.GetValueAsync<string>(SettingKeys.PdfPageHeaderHtmlKey);
        var pageFooter = await SystemSettingsService.GetValueAsync<string>(SettingKeys.PdfPageFooterHtmlKey);

        pageHeader = string.Format(pageHeader, dispute.FileNumber, createdDateTime.ToLongDateString());
        pageFooter = string.Format(pageFooter);

        var pdfTempFileName = Guid.NewGuid();
        var targetFilePath = Path.Combine(tempFolder, pdfTempFileName.ToString());

        var pdfGenerator = new PdfDocumentGenerateIntegrationEventHandler(Bus);
        var fileInfo = pdfGenerator.GetPdfFromServiceAsync(pdfFileRequest.HtmlForPdf, targetFilePath, pageHeader, pageFooter);

        return fileInfo;
    }

    public async Task<bool> FileExists(int fileId)
    {
        var file = await UnitOfWork.FileRepository.GetByIdAsync(fileId);

        return file != null;
    }

    public async Task<bool> FileExists(string originalFileName)
    {
        var file = await UnitOfWork.FileRepository.FindAllAsync(f => f.OriginalFileName == originalFileName);
        return file.Any();
    }

    public async Task<bool> SoftDelete(int fileId)
    {
        var file = await UnitOfWork.FileRepository.GetByIdAsync(fileId, true);

        if (file != null)
        {
            file.IsSourceFileDeleted = true;
            UnitOfWork.FileRepository.Update(file);
            await UnitOfWork.Complete();
        }

        return true;
    }

    public async Task<bool> IsFileAssociatedToDispute(int fileId, Guid disputeGuid)
    {
        var file = await UnitOfWork.FileRepository.GetByIdAsync(fileId);
        if (file != null && file.DisputeGuid == disputeGuid)
        {
            return true;
        }

        return false;
    }

    private async Task<string> GetFileUrl(CmFile file)
    {
        var rootPath = await SystemSettingsService.GetValueAsync<string>(SettingKeys.FileRepositoryBaseUrl);

        return $"{rootPath}/{file.FileGuid}/{file.FileName}";
    }

    private StorageType GetStorageType(DisputeStorageType disputeStorageType)
    {
        return disputeStorageType switch
        {
            DisputeStorageType.Hot => StorageType.File,
            DisputeStorageType.Cold => StorageType.FileCold,
            _ => throw new ArgumentOutOfRangeException(nameof(disputeStorageType), disputeStorageType, null)
        };
    }
}