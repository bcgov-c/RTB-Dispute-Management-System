using System;
using System.Threading.Tasks;
using CM.Business.Entities.Models.Dispute;
using CM.Business.Entities.Models.Files;
using CM.Business.Services.Base;
using CM.Data.Model;

namespace CM.Business.Services.Files;

public interface IFileService : IServiceBase, IDisputeResolver
{
    Task<FileResponse> CreateAsync(DisputeResponse dispute, FileRequest fileRequest);

    Task<FileResponse> CreateAsyncV2(DisputeResponse dispute, FileUploadInfo fileUploadInfo);

    Task<bool> DeleteAsync(int fileId);

    Task<FileResponse> GetAsync(Guid fileGuid);

    Task<FileResponse> GetAsync(int fileId);

    Task<FileInfoResponse> GetFileInfo(int fileId);

    Task<DisputeFileInfoResponse> GetDisputeFiles(Guid disputeGuid, FileInfoGetRequest request);

    Task<FileInfoPatchResponse> PatchFileInfo(File file);

    Task<File> GetNoTrackingFileAsync(int id);

    Task<bool> CheckAddedBy(int fileId, int addedBy);

    Task<System.IO.FileInfo> CreatePdf(DisputeResponse dispute, PdfFileRequest pdfFileRequest, DateTime createdDateTime);

    Task<bool> FileExists(int fileId);

    Task<bool> FileExists(string originalFileName);
}