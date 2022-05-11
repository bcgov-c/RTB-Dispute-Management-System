using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using CM.Business.Entities.Models.ExternalFile;
using CM.Business.Entities.Models.Files;
using CM.Data.Model;

namespace CM.Business.Services.ExternalFileService;

public interface IExternalFileService : IServiceBase
{
    Task<ExternalFileResponse> CreateAsync(FileUploadInfo fileUploadInfo, int externalCustomDataObjectId);

    Task<bool> DeleteAsync(int externalFileId);

    Task<ExternalFileResponse> GetAsync(int externalFileId);

    Task<ExternalFileResponse> GetAsync(Guid fileGuid);

    Task<List<ExternalFileResponse>> GetAllAsync(int externalCustomDataObjectId);

    Task<string> GetFilePath(string filePath);

    Task<ExternalFile> GetNoTrackingFileAsync(int id);

    Task<ExternalFileResponse> PatchFileInfo(ExternalFile externalFile);

    Task<bool> FileExists(int externalFileId);

    Task<FileInfo> CreatePdf(PdfFileRequest pdfFileRequest, DateTime createdDateTime);
}