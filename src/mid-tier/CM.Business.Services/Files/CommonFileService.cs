using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Files;
using CM.Business.Services.SystemSettingsService;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.Files;

public class CommonFileService : CmServiceBase, ICommonFileService
{
    public CommonFileService(IMapper mapper, IUnitOfWork unitOfWork, ISystemSettingsService systemSettingsService)
        : base(unitOfWork, mapper)
    {
        SystemSettingsService = systemSettingsService;
    }

    private ISystemSettingsService SystemSettingsService { get; }

    public async Task<DateTime?> GetLastModifiedDateAsync(object fileId)
    {
        return await UnitOfWork.FileRepository.GetLastModifiedDateAsync((int)fileId);
    }

    public async Task<CommonFileResponse> CreateAsync(CommonFileRequest request)
    {
        var newFile = MapperService.Map<CommonFileRequest, CommonFile>(request);
        newFile.IsDeleted = false;

        var fileResult = await UnitOfWork.CommonFileRepository.InsertAsync(newFile);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            var commonFileResponse = MapperService.Map<CommonFileResponse>(fileResult);
            commonFileResponse.FileUrl = await GetFileUrl(fileResult);
            return commonFileResponse;
        }

        return null;
    }

    public async Task<bool> DeleteAsync(int commonFileId)
    {
        var file = await UnitOfWork.CommonFileRepository.GetByIdAsync(commonFileId);
        if (file != null)
        {
            file.IsDeleted = true;
            UnitOfWork.CommonFileRepository.Attach(file);
            var result = await UnitOfWork.Complete();

            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<CommonFileResponse> GetAsync(int commonFileId)
    {
        var file = await UnitOfWork.CommonFileRepository.GetByIdAsync(commonFileId);
        if (file != null)
        {
            return MapperService.Map<CommonFile, CommonFileResponse>(file);
        }

        return null;
    }

    public async Task<CommonFileResponse> GetAsync(Guid fileGuid)
    {
        var file = await UnitOfWork.CommonFileRepository.GetNoTrackingByIdAsync(
            r => r.CommonFileGuid.Equals(fileGuid));

        if (file != null)
        {
            return MapperService.Map<CommonFile, CommonFileResponse>(file);
        }

        return null;
    }

    public async Task<List<CommonFileResponse>> GetAllAsync(CommonFileType? fileType, int count, int index)
    {
        if (count == 0)
        {
            count = int.MaxValue;
        }

        var commonFilesResponse = new List<CommonFileResponse>();
        var commonFiles = await UnitOfWork.CommonFileRepository.GetCommonFilesByType(fileType, count, index);
        if (commonFiles != null)
        {
            foreach (var commonFile in commonFiles)
            {
                var commonFileResponse = MapperService.Map<CommonFile, CommonFileResponse>(commonFile);
                commonFileResponse.FileUrl = await GetFileUrl(commonFile);
                commonFilesResponse.Add(commonFileResponse);
            }

            return commonFilesResponse;
        }

        return new List<CommonFileResponse>();
    }

    public async Task<string> GetFilePath(string filePath)
    {
        var rootFileFolder = await SystemSettingsService.GetValueAsync<string>(SettingKeys.CommonFileStorageRoot);
        return Path.Combine(rootFileFolder, filePath);
    }

    public async Task<bool> ProfilePictureExists(int? profilePictureId)
    {
        if (profilePictureId != null)
        {
            var profilePictureFile =
                await UnitOfWork.CommonFileRepository.GetCommonFileWithType((int)profilePictureId, CommonFileType.ProfilePicture);

            return profilePictureFile != null;
        }

        return false;
    }

    public async Task<bool> SignatureFileExists(int? signatureFileId)
    {
        if (signatureFileId != null)
        {
            var signatureFile =
                await UnitOfWork.CommonFileRepository.GetCommonFileWithType((int)signatureFileId, CommonFileType.Signature);

            return signatureFile != null;
        }

        return false;
    }

    public async Task<CommonFile> GetNoTrackingFileAsync(int id)
    {
        return await UnitOfWork.CommonFileRepository.GetNoTrackingByIdAsync(p => p.CommonFileId == id);
    }

    public async Task<CommonFileResponse> PatchFileInfo(CommonFile commonFile)
    {
        UnitOfWork.CommonFileRepository.Attach(commonFile);
        var result = await UnitOfWork.Complete();

        if (!result.CheckSuccess())
        {
            return null;
        }

        var commonFileResponse = MapperService.Map<CommonFile, CommonFileResponse>(commonFile);
        commonFileResponse.FileUrl = await GetFileUrl(commonFile);
        return commonFileResponse;
    }

    public async Task<bool> FileExists(int commonFileId)
    {
        var file = await UnitOfWork.CommonFileRepository.GetByIdAsync(commonFileId);

        return file != null;
    }

    private async Task<string> GetFileUrl(CommonFile file)
    {
        var rootPath = await SystemSettingsService.GetValueAsync<string>(SettingKeys.CommonFileRepositoryBaseUrl);

        return $"{rootPath}/{file.CommonFileGuid}/{file.FileName}";
    }
}