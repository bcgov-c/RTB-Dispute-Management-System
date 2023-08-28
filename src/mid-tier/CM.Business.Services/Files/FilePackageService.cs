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

public class FilePackageService : CmServiceBase, IFilePackageService
{
    public FilePackageService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<Guid> ResolveDisputeGuid(int id)
    {
        var entity = await UnitOfWork.FilePackageRepository.GetNoTrackingByIdAsync(x => x.FilePackageId == id);
        return entity?.DisputeGuid ?? Guid.Empty;
    }

    public async Task<FilePackageResponse> CreateAsync(Guid disputeGuid, FilePackageRequest request)
    {
        var newFilePackage = MapperService.Map<FilePackageRequest, FilePackage>(request);

        newFilePackage.DisputeGuid = disputeGuid;
        newFilePackage.IsDeleted = false;

        var filePackageResult = await UnitOfWork.FilePackageRepository.InsertAsync(newFilePackage);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            if (request.CreatedById.HasValue)
            {
                await CreateFilePackageServices(filePackageResult);
            }

            return MapperService.Map<FilePackage, FilePackageResponse>(filePackageResult);
        }

        return null;
    }

    public async Task<bool> DeleteAsync(int filePackageId)
    {
        var filePackageExists = await UnitOfWork.FilePackageRepository.CheckFilePackageExistenceAsync(filePackageId);
        if (filePackageExists)
        {
            await UnitOfWork.FilePackageRepository.DeleteAsync(filePackageId);

            var marked = await MarkForUpdateChildEntities(filePackageId);

            if (marked)
            {
                var result = await UnitOfWork.Complete();
                return result.CheckSuccess();
            }

            return false;
        }

        return false;
    }

    public async Task<List<FilePackageResponse>> GetByDisputeGuidAsync(Guid disputeGuid, int count, int index)
    {
        if (count == 0)
        {
            count = int.MaxValue;
        }

        var filePackagesFullResponseList = new List<FilePackageResponse>();
        var disputeFilePackages = await UnitOfWork.FilePackageRepository.GetDisputeFilePackagesAsync(disputeGuid, count, index);
        if (disputeFilePackages != null)
        {
            filePackagesFullResponseList = MapperService.Map<List<FilePackage>, List<FilePackageResponse>>(disputeFilePackages);
        }

        return filePackagesFullResponseList;
    }

    public async Task<FilePackageResponse> GetByIdAsync(int filePackageId)
    {
        var filePackage = await UnitOfWork.FilePackageRepository.GetByIdAsync(filePackageId);
        if (filePackage != null)
        {
            return MapperService.Map<FilePackage, FilePackageResponse>(filePackage);
        }

        return null;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        var lastModifiedDate = await UnitOfWork.FilePackageRepository.GetLastModifiedDateAsync((int)id);
        return lastModifiedDate;
    }

    public async Task<FilePackage> GetTrackingFilePackageAsync(int filePackageId)
    {
        var filePackage = await UnitOfWork.FilePackageRepository.GetByIdAsync(filePackageId);
        return filePackage;
    }

    public async Task<FilePackageResponse> PatchAsync(FilePackage filePackage)
    {
        UnitOfWork.FilePackageRepository.Attach(filePackage);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<FilePackage, FilePackageResponse>(filePackage);
        }

        return null;
    }

    private async System.Threading.Tasks.Task CreateFilePackageServices(FilePackage filePackageResult)
    {
        var claimGroups = new List<ClaimGroupParticipant>();
        var claimGroupParticipant = await UnitOfWork.ClaimGroupParticipantRepository.GetClaimGroupParticipantByParticipantId(filePackageResult.CreatedById.GetValueOrDefault());

        if (claimGroupParticipant == null)
        {
            return;
        }

        switch (claimGroupParticipant.GroupParticipantRole)
        {
            case (byte)GroupParticipantRole.Applicant:
            {
                var claimGroupsCollection = await UnitOfWork.ClaimGroupParticipantRepository
                    .FindAllAsync(x => x.GroupParticipantRole == (byte)GroupParticipantRole.Respondent && x.DisputeGuid == filePackageResult.DisputeGuid);
                claimGroups = claimGroupsCollection.ToList();

                break;
            }

            case (byte)GroupParticipantRole.Respondent:
            {
                var claimGroupsCollection = await UnitOfWork.ClaimGroupParticipantRepository
                    .FindAllAsync(x => x.GroupParticipantRole == (byte)GroupParticipantRole.Applicant && x.DisputeGuid == filePackageResult.DisputeGuid);
                claimGroups = claimGroupsCollection.ToList();

                break;
            }
        }

        var partyIds = claimGroups.Select(x => x.ParticipantId).ToList();
        var selectedParticipants = await UnitOfWork.ParticipantRepository
            .FindAllAsync(x => partyIds.Contains(x.ParticipantId) &&
                               x.ParticipantStatus != (byte)ParticipantStatus.Removed &&
                               x.ParticipantStatus != (byte)ParticipantStatus.Deleted);
        var selectedParticipantIds = selectedParticipants.Select(x => x.ParticipantId).ToList();

        foreach (var participantId in selectedParticipantIds)
        {
            var newFilePackageService = new Data.Model.FilePackageService
            {
                FilePackageId = filePackageResult.FilePackageId,
                ParticipantId = participantId,
                IsDeleted = false
            };
            await UnitOfWork.FilePackageServiceRepository.InsertAsync(newFilePackageService);

            await UnitOfWork.Complete();

            await UnitOfWork.ServiceAuditLogRepository.InsertAsync(
                new Data.Model.ServiceAuditLog
                {
                    DisputeGuid = filePackageResult.DisputeGuid,
                    ServiceType = ServiceType.FilePackage,
                    ServiceChangeType = ServiceChangeType.CreateRecord,
                    ParticipantId = participantId,
                    FilePackageServiceId = newFilePackageService.FilePackageServiceId
                });
        }

        await UnitOfWork.Complete();
    }

    private async Task<bool> MarkForUpdateChildEntities(int filePackageId)
    {
        try
        {
            var filePackageServices = await UnitOfWork.FilePackageServiceRepository.FindAllAsync(x => x.FilePackageId == filePackageId);
            var fileDescriptions = filePackageServices.Where(x => x.ProofFileDescriptionId != null).Select(x => x.ProofFileDescriptionId);

            foreach (var filePackageService in filePackageServices)
            {
                filePackageService.IsDeleted = true;
                UnitOfWork.FilePackageServiceRepository.Attach(filePackageService);
            }

            foreach (var fileDescriptionId in fileDescriptions)
            {
                var fileDescription = await UnitOfWork.FileDescriptionRepository.GetByIdAsync(fileDescriptionId.Value);
                fileDescription.IsDeficient = true;
                fileDescription.IsDeficientReason = $"Service record removed by system because FilePackage was deleted on {DateTime.Now.ToPstDateTime()} PST";
                UnitOfWork.FileDescriptionRepository.Attach(fileDescription);
            }
        }
        catch (Exception)
        {
            return false;
        }

        return true;
    }
}