using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.OutcomeDocRequest;
using CM.Business.Services.Base;

namespace CM.Business.Services.OutcomeDocRequest;

public interface IOutcomeDocRequestService : IServiceBase, IDisputeResolver
{
    Task<OutcomeDocRequestResponse> CreateAsync(Guid disputeGuid, OutcomeDocRequestRequest request);

    Task<Data.Model.OutcomeDocRequest> GetNoTrackingOutcomeDocRequestAsync(int outcomeDocRequestId);

    Task<Data.Model.OutcomeDocRequest> PatchAsync(Data.Model.OutcomeDocRequest originalOutcomeDocRequest);

    Task<bool> IsActiveSubmitter(Guid disputeGuid, int submitterId);

    Task<bool> IsActiveFileDescription(Guid disputeGuid, int fileDescriptionId);

    Task<bool> IsActiveOutcomeDocGroup(Guid disputeGuid, int outcomeDocGroupId);

    Task<bool> DeleteAsync(int outcomeDocRequestId);

    Task<bool> IsAnyOutcomeDocReqItems(int outcomeDocRequestId);

    Task<OutcomeDocRequestGetResponse> GetByIdAsync(int outcomeDocRequestId);

    Task<List<OutcomeDocRequestGetResponse>> GetByDispute(Guid disputeGuid);

    Task<List<ExternalOutcomeDocRequestGetResponse>> GetExternalOutcomeDocRequests(Guid disputeGuid);
}