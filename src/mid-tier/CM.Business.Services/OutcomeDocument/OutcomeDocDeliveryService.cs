using System;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.OutcomeDocument;
using CM.Business.Entities.Models.OutcomeDocument.Reporting;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.OutcomeDocument;

public class OutcomeDocDeliveryService : CmServiceBase, IOutcomeDocDeliveryService
{
    public OutcomeDocDeliveryService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<Guid> ResolveDisputeGuid(int id)
    {
        var entity = await UnitOfWork.OutcomeDocDeliveryRepository.GetNoTrackingByIdAsync(c => c.OutcomeDocDeliveryId == id);
        return entity?.DisputeGuid ?? Guid.Empty;
    }

    public async Task<OutcomeDocDeliveryResponse> CreateAsync(int outcomeDocFileId, OutcomeDocDeliveryPostRequest outcomeDocDelivery)
    {
        var newOutcomeDocDelivery = MapperService.Map<OutcomeDocDeliveryPostRequest, OutcomeDocDelivery>(outcomeDocDelivery);
        newOutcomeDocDelivery.OutcomeDocFileId = outcomeDocFileId;
        newOutcomeDocDelivery.IsDeleted = false;
        newOutcomeDocDelivery.DisputeGuid = outcomeDocDelivery.DisputeGuid;
        if (outcomeDocDelivery.ReadyForDelivery != null && (bool)outcomeDocDelivery.ReadyForDelivery)
        {
            newOutcomeDocDelivery.ReadyForDeliveryDate = DateTime.UtcNow;
        }
        else
        {
            newOutcomeDocDelivery.ReadyForDelivery = null;
        }

        var outcomeDocDeliveryResult = await UnitOfWork.OutcomeDocDeliveryRepository.InsertAsync(newOutcomeDocDelivery);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<OutcomeDocDelivery, OutcomeDocDeliveryResponse>(outcomeDocDeliveryResult);
        }

        return null;
    }

    public async Task<OutcomeDocDeliveryResponse> PatchAsync(int outcomeDocDeliveryId, OutcomeDocDeliveryPatchRequest outcomeDocDeliveryPatchRequest)
    {
        var outcomeDocDeliveryToPatch = await UnitOfWork.OutcomeDocDeliveryRepository.GetNoTrackingByIdAsync(r => r.OutcomeDocDeliveryId == outcomeDocDeliveryId);
        MapperService.Map(outcomeDocDeliveryPatchRequest, outcomeDocDeliveryToPatch);

        if (outcomeDocDeliveryPatchRequest.ReadyForDelivery != null && (bool)outcomeDocDeliveryPatchRequest.ReadyForDelivery)
        {
            outcomeDocDeliveryToPatch.ReadyForDeliveryDate = DateTime.UtcNow;
        }
        else
        {
            outcomeDocDeliveryToPatch.ReadyForDeliveryDate = null;
        }

        UnitOfWork.OutcomeDocDeliveryRepository.Attach(outcomeDocDeliveryToPatch);
        var result = await UnitOfWork.Complete();

        if (result.CheckSuccess())
        {
            return MapperService.Map<OutcomeDocDelivery, OutcomeDocDeliveryResponse>(outcomeDocDeliveryToPatch);
        }

        return null;
    }

    public async Task<OutcomeDocDeliveryPatchRequest> GetForPatchAsync(int outcomeDocDeliveryId)
    {
        var outcomeDocDelivery = await UnitOfWork.OutcomeDocDeliveryRepository.GetNoTrackingByIdAsync(r => r.OutcomeDocDeliveryId == outcomeDocDeliveryId);
        return MapperService.Map<OutcomeDocDelivery, OutcomeDocDeliveryPatchRequest>(outcomeDocDelivery);
    }

    public async Task<bool> DeleteAsync(int outcomeDocDeliveryId)
    {
        var outcomeDocDelivery = await UnitOfWork.OutcomeDocDeliveryRepository.GetByIdAsync(outcomeDocDeliveryId);
        if (outcomeDocDelivery != null)
        {
            outcomeDocDelivery.IsDeleted = true;
            UnitOfWork.OutcomeDocDeliveryRepository.Attach(outcomeDocDelivery);
            var result = await UnitOfWork.Complete();

            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<OutcomeDocDeliveryReportFullResponse> GetAll(OutcomeDocDeliveryGetRequest request, int index, int count)
    {
        if (count == 0)
        {
            count = int.MaxValue;
        }

        var undeliveredOutcomeDocFullResponse = new OutcomeDocDeliveryReportFullResponse();

        var undeliveredOutcomeDocDeliveries =
            await UnitOfWork.OutcomeDocDeliveryRepository.GetAllUndelivered(request, index, count);

        var groupedDeliveries = undeliveredOutcomeDocDeliveries.GroupBy(d => d.DisputeGuid);

        var deliveries = groupedDeliveries.ToList();
        undeliveredOutcomeDocFullResponse.TotalAvailableRecords = deliveries.Count;

        foreach (var groupedDelivery in deliveries)
        {
            var disputeGuid = groupedDelivery.Key;
            var fileNumber = await UnitOfWork.DisputeRepository.GetFileNumber(disputeGuid);
            var latestStatus = await UnitOfWork.DisputeStatusRepository.GetDisputeLastStatusAsync(disputeGuid);
            var totalUndelivered = groupedDelivery.Count();
            var deliveryCreationItem = groupedDelivery.OrderBy(d => d.ModifiedDate).LastOrDefault();
            DateTime? deliveryCreation = null;
            if (deliveryCreationItem != null)
            {
                deliveryCreation = deliveryCreationItem.ModifiedDate;
            }

            var highestPriorityItem = groupedDelivery.OrderBy(d => d.DeliveryPriority).LastOrDefault();
            byte? highestPriority = null;
            if (highestPriorityItem != null)
            {
                highestPriority = highestPriorityItem.DeliveryPriority;
            }

            var deliveryResponse = new OutcomeDocDeliveryReportResponse
            {
                DisputeGuid = disputeGuid,
                FileNumber = fileNumber,
                Stage = latestStatus.Stage,
                Status = latestStatus.Status,
                Owner = latestStatus.Owner,
                Process = latestStatus.Process,
                TotalUndelivered = totalUndelivered,
                DeliveryCreation = deliveryCreation.ToCmDateTimeString(),
                HighestUndeliveredPriority = highestPriority,
                OutcomeDocDeliveryDeliveryMethodReport = new OutcomeDocDeliveryDeliveryMethodReport
                {
                    EmailNotDeliveredCount = groupedDelivery.Count(d => d.DeliveryMethod == (byte?)DeliveryMethod.Email),
                    PickupNotDeliveredCount = groupedDelivery.Count(d => d.DeliveryMethod == (byte?)DeliveryMethod.Pickup),
                    MailNotDeliveredCount = groupedDelivery.Count(d => d.DeliveryMethod == (byte?)DeliveryMethod.Mail),
                    CustomNotDeliveredCount = groupedDelivery.Count(d => d.DeliveryMethod == (byte?)DeliveryMethod.Custom)
                }
            };

            undeliveredOutcomeDocFullResponse.OutcomeDocDeliveries.Add(deliveryResponse);
        }

        return undeliveredOutcomeDocFullResponse;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        var lastModifiedDate = await UnitOfWork.OutcomeDocDeliveryRepository.GetLastModifiedDate((int)id);
        return lastModifiedDate;
    }

    public async Task<bool> IsDuplicateByParticipantId(Guid disputeGuid, int? participantId, int outcomeDocFileId)
    {
        var isAny = await UnitOfWork.OutcomeDocDeliveryRepository.IsDuplicateByParticipantId(disputeGuid, participantId, outcomeDocFileId);
        return isAny;
    }
}