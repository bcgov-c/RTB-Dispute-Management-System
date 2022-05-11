using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Files;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.Files;

public class FileDescriptionService : CmServiceBase, IFileDescriptionService
{
    public FileDescriptionService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<Guid> ResolveDisputeGuid(int id)
    {
        var entity = await UnitOfWork.FileDescriptionRepository.GetNoTrackingByIdAsync(x => x.FileDescriptionId == id);
        return entity?.DisputeGuid ?? Guid.Empty;
    }

    public async Task<FileDescriptionResponse> CreateAsync(Guid disputeGuid, FileDescriptionRequest fileDescription)
    {
        var newFileDescription = MapperService.Map<FileDescriptionRequest, FileDescription>(fileDescription);
        newFileDescription.DisputeGuid = disputeGuid;
        newFileDescription.IsDeleted = false;

        var fileDescriptionResult = await UnitOfWork.FileDescriptionRepository.InsertAsync(newFileDescription);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<FileDescription, FileDescriptionResponse>(fileDescriptionResult);
        }

        return null;
    }

    public async Task<bool> DeleteAsync(int fileDescriptionId)
    {
        var fileDescription = await UnitOfWork.FileDescriptionRepository.GetByIdAsync(fileDescriptionId);
        if (fileDescription != null)
        {
            fileDescription.IsDeleted = true;
            UnitOfWork.FileDescriptionRepository.Attach(fileDescription);
            var result = await UnitOfWork.Complete();
            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<FileDescription> PatchAsync(int fileDescriptionId, FileDescription fileDescription)
    {
        UnitOfWork.FileDescriptionRepository.Attach(fileDescription);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return fileDescription;
        }

        return null;
    }

    public async Task<FileDescriptionResponse> GetAsync(int fileDescriptionId)
    {
        var fileDescription = await UnitOfWork.FileDescriptionRepository.GetByIdAsync(fileDescriptionId);
        if (fileDescription != null)
        {
            return MapperService.Map<FileDescription, FileDescriptionResponse>(fileDescription);
        }

        return null;
    }

    public async Task<FileDescriptionListResponse> GetDisputeFileDescriptionAsync(Guid disputeGuid, int count, int index)
    {
        if (count == 0)
        {
            count = int.MaxValue;
        }

        var fileDescriptions =
            await UnitOfWork.FileDescriptionRepository.GetDisputeFileDescriptionsAsync(disputeGuid);

        var indexedFileDescriptions = fileDescriptions.AsQueryable().ApplyPaging(count, index);

        var fileDescriptionList = new FileDescriptionListResponse
        {
            TotalAvailableCount = fileDescriptions.Count,
            FileDescriptionResponses = MapperService.Map<List<FileDescription>, List<FileDescriptionResponse>>(indexedFileDescriptions.ToList())
        };

        return fileDescriptionList;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        var fileDescriptionLastModified = await UnitOfWork.FileDescriptionRepository.GetLastModifiedDateAsync((int)id);
        return fileDescriptionLastModified;
    }

    public async Task<FileDescription> GetTrackingFileDescriptionAsync(int fileDescriptionId)
    {
        var fileDescription = await UnitOfWork.FileDescriptionRepository.GetByIdAsync(fileDescriptionId);

        return fileDescription;
    }

    public async Task<bool> FileDescriptionExists(int fileDescriptionId)
    {
        var fileDescription = await UnitOfWork.FileDescriptionRepository.GetByIdAsync(fileDescriptionId);
        if (fileDescription != null)
        {
            return true;
        }

        return false;
    }

    public async Task<bool> ClaimExists(int claimId)
    {
        var claim = await UnitOfWork.ClaimRepository.GetClaimById(claimId);
        if (claim != null)
        {
            return true;
        }

        return false;
    }
}