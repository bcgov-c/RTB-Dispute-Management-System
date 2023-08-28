using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.FilePackageService;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;
using DM = CM.Data.Model;

namespace CM.Business.Services.FilePackageService;

public class FilePackageServiceService : CmServiceBase, IFilePackageServiceService
{
    public FilePackageServiceService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<Guid> ResolveDisputeGuid(int id)
    {
        var entityFilePackageService = await UnitOfWork.FilePackageServiceRepository.GetNoTrackingByIdAsync(x => x.FilePackageServiceId == id);
        if (entityFilePackageService != null)
        {
            var entityFilePackage = await UnitOfWork.FilePackageRepository.GetNoTrackingByIdAsync(x => x.FilePackageId == entityFilePackageService.FilePackageId);
            return entityFilePackage?.DisputeGuid ?? Guid.Empty;
        }

        return Guid.Empty;
    }

    public async Task<FilePackageServiceResponse> CreateAsync(int filePackageId, FilePackageServiceRequest request)
    {
        var newFilePackageService = MapperService.Map<FilePackageServiceRequest, DM.FilePackageService>(request);
        newFilePackageService.FilePackageId = filePackageId;
        newFilePackageService.IsDeleted = false;

        var filePackageServiceResult = await UnitOfWork.FilePackageServiceRepository.InsertAsync(newFilePackageService);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            var logResult = await CreateFilePackageSal(ServiceChangeType.CreateRecord, filePackageServiceResult);

            if (logResult)
            {
                return MapperService.Map<DM.FilePackageService, FilePackageServiceResponse>(filePackageServiceResult);
            }
        }

        return null;
    }

    public async Task<bool> DeleteAsync(int filePackageServiceId)
    {
        var filePackageService = await UnitOfWork.FilePackageServiceRepository.GetWithChild(filePackageServiceId);
        if (filePackageService != null)
        {
            await UnitOfWork.FilePackageServiceRepository.Delete(filePackageServiceId);
            var result = await UnitOfWork.Complete();
            if (result.CheckSuccess())
            {
                var logResult = await CreateFilePackageSal(ServiceChangeType.DeleteRecord, filePackageService);

                return logResult;
            }
        }

        return false;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        var lastModifiedDate = await UnitOfWork.FilePackageServiceRepository.GetLastModifiedDateAsync((int)id);
        return lastModifiedDate;
    }

    public async Task<DM.FilePackageService> GetNoTrackingFilePackageServiceAsync(int filePackageServiceId)
    {
        var filePackageService = await UnitOfWork.FilePackageServiceRepository.GetNoTrackingByIdAsync(p => p.FilePackageServiceId == filePackageServiceId);
        return filePackageService;
    }

    public async Task<FilePackageServiceResponse> PatchAsync(int filePackageServiceId, FilePackageServicePatchRequest filePackageServicePatchRequest, ServiceChangeType? serviceChangeType)
    {
        var filePackageService = await UnitOfWork.FilePackageServiceRepository.GetWithChild(filePackageServiceId);

        MapperService.Map(filePackageServicePatchRequest, filePackageService);

        UnitOfWork.FilePackageServiceRepository.Attach(filePackageService);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            var logResult = await CreateFilePackageSal(serviceChangeType, filePackageService);
            if (logResult)
            {
                return MapperService.Map<DM.FilePackageService, FilePackageServiceResponse>(filePackageService);
            }
        }

        return null;
    }

    public ServiceChangeType? GetServiceAuditLogUseCase(Data.Model.FilePackageService originalFilePackageService, FilePackageServicePatchRequest filePackageServiceToPatch)
    {
        if ((originalFilePackageService.IsServed == false || originalFilePackageService.IsServed == null) && filePackageServiceToPatch.IsServed == true)
        {
            return ServiceChangeType.MarkServed;
        }

        if (originalFilePackageService.IsServed == true && filePackageServiceToPatch.IsServed == false)
        {
            return ServiceChangeType.MarkNotServed;
        }

        if ((originalFilePackageService.ServiceMethod != filePackageServiceToPatch.ServiceMethod ||
            originalFilePackageService.ServiceDate != filePackageServiceToPatch.ServiceDate ||
            originalFilePackageService.ReceivedDate != filePackageServiceToPatch.ReceivedDate ||
            originalFilePackageService.ServedBy != filePackageServiceToPatch.ServedBy ||
            originalFilePackageService.ProofFileDescriptionId != filePackageServiceToPatch.ProofFileDescriptionId) &&
            originalFilePackageService.ArchivedBy == filePackageServiceToPatch.ArchivedBy &&
            originalFilePackageService.ArchiveServiceMethod == filePackageServiceToPatch.ArchiveServiceMethod &&
            originalFilePackageService.ArchiveServiceDate == filePackageServiceToPatch.ArchiveServiceDate &&
            originalFilePackageService.ArchiveReceivedDate == filePackageServiceToPatch.ArchiveReceivedDate &&
            originalFilePackageService.ArchiveServiceDateUsed == filePackageServiceToPatch.ArchiveServiceDateUsed &&
            originalFilePackageService.ArchiveServedBy == filePackageServiceToPatch.ArchiveServedBy)
        {
            return ServiceChangeType.EditServiceInformation;
        }

        if (
            (originalFilePackageService.ValidationStatus == 0 ||
            originalFilePackageService.ValidationStatus == null ||
            originalFilePackageService.ValidationStatus == 3 ||
            originalFilePackageService.ValidationStatus == 4)
            &&
            (filePackageServiceToPatch.ValidationStatus == 1 ||
            filePackageServiceToPatch.ValidationStatus == 2)
            )
        {
            return ServiceChangeType.ConfirmRecord;
        }

        if (
            (originalFilePackageService.ValidationStatus == 0 ||
            originalFilePackageService.ValidationStatus == null ||
            originalFilePackageService.ValidationStatus == 1 ||
            originalFilePackageService.ValidationStatus == 2)
            &&
            (filePackageServiceToPatch.ValidationStatus == 3 ||
            filePackageServiceToPatch.ValidationStatus == 4)
            )
        {
            return ServiceChangeType.InvalidateRecord;
        }

        if (originalFilePackageService.ArchivedBy != filePackageServiceToPatch.ArchivedBy ||
            originalFilePackageService.ArchiveServiceMethod != filePackageServiceToPatch.ArchiveServiceMethod ||
            originalFilePackageService.ArchiveServiceDate != filePackageServiceToPatch.ArchiveServiceDate ||
            originalFilePackageService.ArchiveReceivedDate != filePackageServiceToPatch.ArchiveReceivedDate ||
            originalFilePackageService.ArchiveServiceDateUsed != filePackageServiceToPatch.ArchiveServiceDateUsed ||
            originalFilePackageService.ArchiveServedBy != filePackageServiceToPatch.ArchiveServedBy)
        {
            return ServiceChangeType.ArchiveRecord;
        }

        return null;
    }

    private async Task<bool> CreateFilePackageSal(ServiceChangeType? serviceChangeType, DM.FilePackageService filePackageService)
    {
        if (serviceChangeType == null)
        {
            return true;
        }

        await UnitOfWork.ServiceAuditLogRepository.InsertAsync(
                new Data.Model.ServiceAuditLog
                {
                    DisputeGuid = filePackageService.FilePackage.DisputeGuid,
                    ServiceType = ServiceType.FilePackage,
                    ServiceChangeType = serviceChangeType,
                    ParticipantId = filePackageService.ParticipantId,
                    FilePackageServiceId = filePackageService.FilePackageServiceId,
                    OtherParticipantRole = filePackageService.OtherParticipantRole,
                    ProofFileDescriptionId = filePackageService.ProofFileDescriptionId,
                    IsServed = filePackageService.IsServed,
                    ServiceMethod = filePackageService.ServiceMethod != null ? (ServiceMethod)filePackageService.ServiceMethod : null,
                    ReceivedDate = filePackageService.ReceivedDate,
                    ServiceDateUsed = filePackageService.ServiceDateUsed,
                    ServiceDate = filePackageService.ServiceDate,
                    ServiceBy = filePackageService.ServedBy,
                    ServiceComment = filePackageService.ServiceComment,
                    ValidationStatus = filePackageService.ValidationStatus,
                    ServiceDescription = filePackageService.ServiceDescription,
                    OtherProofFileDescriptionId = filePackageService.OtherProofFileDescriptionId
                });

        var result = await UnitOfWork.Complete();

        return result.CheckSuccess();
    }
}