using System.Threading.Tasks;
using CM.Business.Entities.Models.OutcomeDocRequest;
using CM.Business.Services.Base;
using CM.Data.Model;

namespace CM.Business.Services.OutcomeDocRequest;

public interface IOutcomeDocRequestItemService : IServiceBase, IDisputeResolver
{
    Task<bool> OutcomeDocRequestExists(int outcomeDocRequestId);

    Task<OutcomeDocRequestItemResponse> CreateAsync(int outcomeDocRequestId, OutcomeDocRequestItemRequest request);

    Task<bool> IsActiveFileDescription(int outcomeDocRequestId, int fileDescriptionId);

    Task<OutcomeDocReqItem> GetNoTrackingOutcomeDocRequestItemAsync(int outcomeDocReqItemId);

    Task<OutcomeDocReqItem> PatchAsync(OutcomeDocReqItem originalOutcomeDocRequestItem);

    Task<bool> DeleteAsync(int outcomeDocReqItemId);
}