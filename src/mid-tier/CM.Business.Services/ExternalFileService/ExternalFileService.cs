using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.ExternalFile;
using CM.Business.Entities.Models.Files;
using CM.Business.Services.IntegrationEvents.Pdf.EventHandling;
using CM.Business.Services.SystemSettingsService;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using EasyNetQ;

namespace CM.Business.Services.ExternalFileService;

public class ExternalFileService : CmServiceBase, IExternalFileService
{
    public ExternalFileService(IMapper mapper, IUnitOfWork unitOfWork, IBus bus, ISystemSettingsService systemSettingsService)
        : base(unitOfWork, mapper)
    {
        SystemSettingsService = systemSettingsService;
        Bus = bus;
    }

    private ISystemSettingsService SystemSettingsService { get; }

    private IBus Bus { get; }

    public async Task<DateTime?> GetLastModifiedDateAsync(object fileId)
    {
        return await UnitOfWork.FileRepository.GetLastModifiedDateAsync((int)fileId);
    }

    public async Task<ExternalFileResponse> CreateAsync(FileUploadInfo fileUploadInfo, int externalCustomDataObjectId)
    {
        var newFile = MapperService.Map<FileUploadInfo, ExternalFile>(fileUploadInfo);
        newFile.IsDeleted = false;
        newFile.ExternalCustomDataObjectId = externalCustomDataObjectId;

        var fileResult = await UnitOfWork.ExternalFileRepository.InsertAsync(newFile);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            var externalFileResponse = MapperService.Map<ExternalFileResponse>(fileResult);
            externalFileResponse.FileUrl = await GetFileUrl(fileResult);
            return externalFileResponse;
        }

        return null;
    }

    public async Task<bool> DeleteAsync(int externalFileId)
    {
        var file = await UnitOfWork.ExternalFileRepository.GetByIdAsync(externalFileId);
        if (file != null)
        {
            file.IsDeleted = true;
            UnitOfWork.ExternalFileRepository.Attach(file);
            var result = await UnitOfWork.Complete();

            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<ExternalFileResponse> GetAsync(int externalFileId)
    {
        var file = await UnitOfWork.ExternalFileRepository.GetByIdAsync(externalFileId);
        if (file != null)
        {
            return MapperService.Map<ExternalFile, ExternalFileResponse>(file);
        }

        return null;
    }

    public async Task<ExternalFileResponse> GetAsync(Guid fileGuid)
    {
        var file = await UnitOfWork.ExternalFileRepository.GetNoTrackingByIdAsync(
            r => r.FileGuid.Equals(fileGuid));

        if (file != null)
        {
            return MapperService.Map<ExternalFile, ExternalFileResponse>(file);
        }

        return null;
    }

    public async Task<List<ExternalFileResponse>> GetAllAsync(int externalCustomDataObjectId)
    {
        var externalFilesResponse = new List<ExternalFileResponse>();
        var externalFiles = await UnitOfWork.ExternalFileRepository.GetExternalFilesByType(externalCustomDataObjectId);
        if (externalFiles != null)
        {
            foreach (var externalFile in externalFiles)
            {
                var externalFileResponse = MapperService.Map<ExternalFile, ExternalFileResponse>(externalFile);
                externalFileResponse.FileUrl = await GetFileUrl(externalFile);
                externalFilesResponse.Add(externalFileResponse);
            }

            return externalFilesResponse;
        }

        return new List<ExternalFileResponse>();
    }

    public async Task<string> GetFilePath(string filePath)
    {
        var rootFileFolder = await SystemSettingsService.GetValueAsync<string>(SettingKeys.ExternalFileStorageRoot);
        return Path.Combine(rootFileFolder, filePath);
    }

    public async Task<ExternalFile> GetNoTrackingFileAsync(int id)
    {
        return await UnitOfWork.ExternalFileRepository.GetNoTrackingByIdAsync(p => p.ExternalFileId == id);
    }

    public async Task<ExternalFileResponse> PatchFileInfo(ExternalFile externalFile)
    {
        UnitOfWork.ExternalFileRepository.Attach(externalFile);
        var result = await UnitOfWork.Complete();

        if (!result.CheckSuccess())
        {
            return null;
        }

        var externalFileResponse = MapperService.Map<ExternalFile, ExternalFileResponse>(externalFile);
        externalFileResponse.FileUrl = await GetFileUrl(externalFile);
        return externalFileResponse;
    }

    public async Task<FileInfo> CreatePdf(PdfFileRequest pdfFileRequest, DateTime createdDateTime)
    {
        var tempFolder = await SystemSettingsService.GetValueAsync<string>(SettingKeys.TempStorageRoot);

        var pageHeader = string.Empty;
        var pageFooter = await SystemSettingsService.GetValueAsync<string>(SettingKeys.PdfPageFooterHtmlKey);

        var pdfTempFileName = Guid.NewGuid();
        var targetFilePath = Path.Combine(tempFolder, pdfTempFileName.ToString());

        var pdfGenerator = new PdfDocumentGenerateIntegrationEventHandler(Bus);
        var fileInfo = pdfGenerator.GetPdfFromServiceAsync(pdfFileRequest.HtmlForPdf, targetFilePath, pageHeader, pageFooter);

        return fileInfo;
    }

    public async Task<bool> FileExists(int externalFileId)
    {
        var file = await UnitOfWork.ExternalFileRepository.GetByIdAsync(externalFileId);

        return file != null;
    }

    private async Task<string> GetFileUrl(ExternalFile file)
    {
        var rootPath = await SystemSettingsService.GetValueAsync<string>(SettingKeys.ExternalFileRepositoryBaseUrl);

        return $"{rootPath}/{file.FileGuid}/{file.FileName}";
    }
}