using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.Files;
using CM.Common.Utilities;
using CM.Data.Model;

namespace CM.Business.Services.Files;

public interface ICommonFileService : IServiceBase
{
    Task<CommonFileResponse> CreateAsync(CommonFileRequest request);

    Task<bool> DeleteAsync(int commonFileId);

    Task<CommonFileResponse> GetAsync(int commonFileId);

    Task<CommonFileResponse> GetAsync(Guid fileGuid);

    Task<List<CommonFileResponse>> GetAllAsync(CommonFileType? fileType, int count, int index);

    Task<string> GetFilePath(string filePath);

    Task<bool> ProfilePictureExists(int? profilePictureId);

    Task<bool> SignatureFileExists(int? signatureFileId);

    Task<CommonFile> GetNoTrackingFileAsync(int id);

    Task<CommonFileResponse> PatchFileInfo(CommonFile commonFile);

    Task<bool> FileExists(int commonFileId);
}