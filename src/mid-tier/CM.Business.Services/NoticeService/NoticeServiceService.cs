using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.NoticeService;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.NoticeService;

public class NoticeServiceService : CmServiceBase, INoticeServiceService
{
    public NoticeServiceService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<Guid> ResolveDisputeGuid(int id)
    {
        var entityNoticeService = await UnitOfWork.NoticeServiceRepository.GetNoTrackingByIdAsync(x => x.NoticeServiceId == id);
        if (entityNoticeService != null)
        {
            var entityNotice = await UnitOfWork.NoticeRepository.GetNoTrackingByIdAsync(x => x.NoticeId == entityNoticeService.NoticeId);
            return entityNotice?.DisputeGuid ?? Guid.Empty;
        }

        return Guid.Empty;
    }

    public async Task<NoticeServiceResponse> CreateAsync(int noticeId, NoticeServiceRequest request)
    {
        var newNoticeService = MapperService.Map<NoticeServiceRequest, Data.Model.NoticeService>(request);
        newNoticeService.NoticeId = noticeId;
        newNoticeService.IsDeleted = false;
        var noticeServiceResult = await UnitOfWork.NoticeServiceRepository.InsertAsync(newNoticeService);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            var logResult = await CreateNoticeSal(ServiceChangeType.CreateRecord, noticeServiceResult);

            if (logResult)
            {
                return MapperService.Map<Data.Model.NoticeService, NoticeServiceResponse>(noticeServiceResult);
            }
        }

        return null;
    }

    public async Task<bool> DeleteAsync(int noticeServiceId)
    {
        var noticeService = await UnitOfWork.NoticeServiceRepository.GetNServiceWithNotice(noticeServiceId);
        if (noticeService != null)
        {
            noticeService.IsDeleted = true;
            UnitOfWork.NoticeServiceRepository.Attach(noticeService);
            var result = await UnitOfWork.Complete();

            if (result.CheckSuccess())
            {
                var logResult = await CreateNoticeSal(ServiceChangeType.DeleteRecord, noticeService);

                return logResult;
            }
        }

        return false;
    }

    public async Task<Data.Model.NoticeService> PatchAsync(Data.Model.NoticeService noticeService, ServiceChangeType? serviceChangeType)
    {
        UnitOfWork.NoticeServiceRepository.Attach(noticeService);
        var result = await UnitOfWork.Complete();

        if (result.CheckSuccess())
        {
            var logResult = await CreateNoticeSal(serviceChangeType, noticeService);
            if (logResult)
            {
                return noticeService;
            }
        }

        return null;
    }

    public async Task<Data.Model.NoticeService> GetNoTrackingNoticeServiceAsync(int noticeServiceId)
    {
        var noticeService = await UnitOfWork.NoticeServiceRepository.GetNoTrackingByIdAsync(r =>
            r.NoticeServiceId == noticeServiceId);
        return noticeService;
    }

    public async Task<Data.Model.NoticeService> GetNoticeServiceAsync(int noticeServiceId)
    {
        var noticeService = await UnitOfWork.NoticeServiceRepository.GetNServiceWithNotice(noticeServiceId);
        return noticeService;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object noticeServiceId)
    {
        var lastModifiedDate = await UnitOfWork.NoticeServiceRepository.GetLastModifiedDate((int)noticeServiceId);

        return lastModifiedDate;
    }

    public ServiceChangeType? GetServiceAuditLogUseCase(Data.Model.NoticeService originalNoticeService, NoticeServicePatchRequest noticeServiceToPatch)
    {
        if ((originalNoticeService.IsServed == false || originalNoticeService.IsServed == null) && noticeServiceToPatch.IsServed == true)
        {
            return ServiceChangeType.MarkServed;
        }

        if (originalNoticeService.IsServed == true && (noticeServiceToPatch.IsServed == false || noticeServiceToPatch.IsServed == null))
        {
            return ServiceChangeType.MarkNotServed;
        }

        if ((originalNoticeService.ServiceMethod != noticeServiceToPatch.ServiceMethod ||
            originalNoticeService.ServiceDate != noticeServiceToPatch.ServiceDate ||
            originalNoticeService.ReceivedDate != noticeServiceToPatch.ReceivedDate ||
            originalNoticeService.ServedBy != noticeServiceToPatch.ServedBy ||
            originalNoticeService.ProofFileDescriptionId != noticeServiceToPatch.ProofFileDescriptionId) &&
            originalNoticeService.ArchivedBy == noticeServiceToPatch.ArchivedBy &&
            originalNoticeService.ArchiveServiceMethod == noticeServiceToPatch.ArchiveServiceMethod &&
            originalNoticeService.ArchiveServiceDate == noticeServiceToPatch.ArchiveServiceDate &&
            originalNoticeService.ArchiveReceivedDate == noticeServiceToPatch.ArchiveReceivedDate &&
            originalNoticeService.ArchiveServiceDateUsed == noticeServiceToPatch.ArchiveServiceDateUsed &&
            originalNoticeService.ArchiveServedBy == noticeServiceToPatch.ArchiveServedBy)
        {
            return ServiceChangeType.EditServiceInformation;
        }

        if (
            (originalNoticeService.ValidationStatus == 0 ||
            originalNoticeService.ValidationStatus == null ||
            originalNoticeService.ValidationStatus == 3 ||
            originalNoticeService.ValidationStatus == 4)
            &&
            (noticeServiceToPatch.ValidationStatus == 1 ||
            noticeServiceToPatch.ValidationStatus == 2)
            )
        {
            return ServiceChangeType.ConfirmRecord;
        }

        if (
            (originalNoticeService.ValidationStatus == 0 ||
            originalNoticeService.ValidationStatus == null ||
            originalNoticeService.ValidationStatus == 1 ||
            originalNoticeService.ValidationStatus == 2)
            &&
            (noticeServiceToPatch.ValidationStatus == 3 ||
            noticeServiceToPatch.ValidationStatus == 4)
            )
        {
            return ServiceChangeType.InvalidateRecord;
        }

        if (originalNoticeService.ArchivedBy != noticeServiceToPatch.ArchivedBy ||
            originalNoticeService.ArchiveServiceMethod != noticeServiceToPatch.ArchiveServiceMethod ||
            originalNoticeService.ArchiveServiceDate != noticeServiceToPatch.ArchiveServiceDate ||
            originalNoticeService.ArchiveReceivedDate != noticeServiceToPatch.ArchiveReceivedDate ||
            originalNoticeService.ArchiveServiceDateUsed != noticeServiceToPatch.ArchiveServiceDateUsed ||
            originalNoticeService.ArchiveServedBy != noticeServiceToPatch.ArchiveServedBy)
        {
            return ServiceChangeType.ArchiveRecord;
        }

        return null;
    }

    private async Task<bool> CreateNoticeSal(ServiceChangeType? serviceChangeType, Data.Model.NoticeService noticeService)
    {
        if (serviceChangeType == null)
        {
            return true;
        }

        await UnitOfWork.ServiceAuditLogRepository.InsertAsync(
                new Data.Model.ServiceAuditLog
                {
                    DisputeGuid = noticeService.Notice.DisputeGuid,
                    ServiceType = ServiceType.Notice,
                    ServiceChangeType = serviceChangeType,
                    ParticipantId = noticeService.ParticipantId,
                    NoticeServiceId = noticeService.NoticeServiceId,
                    ProofFileDescriptionId = noticeService.ProofFileDescriptionId,
                    OtherParticipantRole = noticeService.OtherParticipantRole,
                    IsServed = noticeService.IsServed,
                    ServiceMethod = noticeService.ServiceMethod != null ? (ServiceMethod)noticeService.ServiceMethod : null,
                    ReceivedDate = noticeService.ReceivedDate,
                    ServiceDateUsed = noticeService.ServiceDateUsed,
                    ServiceDate = noticeService.ServiceDate,
                    ServiceBy = noticeService.ServedBy,
                    ServiceComment = noticeService.ServiceComment,
                    ValidationStatus = noticeService.ValidationStatus,
                    ServiceDescription = noticeService.ServiceDescription,
                    OtherProofFileDescriptionId = noticeService.OtherProofFileDescriptionId
                });

        var result = await UnitOfWork.Complete();

        return result.CheckSuccess();
    }
}