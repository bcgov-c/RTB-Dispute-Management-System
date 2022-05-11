using System;
using System.Threading.Tasks;
using CM.Business.Entities.Models.OutcomeDocument;
using CM.Business.Entities.Models.OutcomeDocument.Reporting;
using CM.Business.Services.Base;

namespace CM.Business.Services.OutcomeDocument;

public interface IOutcomeDocDeliveryService : IServiceBase, IDisputeResolver
{
    Task<OutcomeDocDeliveryResponse> CreateAsync(int outcomeDocFileId, OutcomeDocDeliveryPostRequest outcomeDocDelivery);

    Task<OutcomeDocDeliveryResponse> PatchAsync(int outcomeDocDeliveryId, OutcomeDocDeliveryPatchRequest outcomeDocDeliveryPatchRequest);

    Task<OutcomeDocDeliveryPatchRequest> GetForPatchAsync(int noteId);

    Task<bool> DeleteAsync(int outcomeDocDeliveryId);

    Task<OutcomeDocDeliveryReportFullResponse> GetAll(OutcomeDocDeliveryGetRequest request, int index, int count);

    Task<bool> IsDuplicateByParticipantId(Guid disputeGuid, int? participantId, int outcomeDocFileId);
}