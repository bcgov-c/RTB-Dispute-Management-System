using System;
using System.Threading.Tasks;
using CM.Business.Entities.Models.OutcomeDocument;
using CM.Business.Services.Base;
using CM.Data.Model;

namespace CM.Business.Services.OutcomeDocument;

public interface IOutcomeDocFileService : IServiceBase, IDisputeResolver
{
    Task<OutcomeDocFileResponse> CreateAsync(int outcomeDocGroupId, OutcomeDocFilePostRequest outcomeDocFile);

    Task<OutcomeDocFile> PatchAsync(OutcomeDocFile outcomeDocFile, bool createPostedDecision, bool deletePostedDecision);

    Task<OutcomeDocFile> GetNoTrackingOutcomeDocFileAsync(int outcomeDocFileId);

    Task<bool> DeleteAsync(int outcomeDocFileId);

    Task<bool> OutcomeDocFileExists(int outcomeDocFileId);

    Task<bool> IsDeliveredOutcomeDocument(Guid disputeGuid);
}