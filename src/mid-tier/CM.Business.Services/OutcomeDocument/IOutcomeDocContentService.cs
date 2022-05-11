using System.Threading.Tasks;
using CM.Business.Entities.Models.OutcomeDocument;
using CM.Business.Services.Base;
using CM.Data.Model;

namespace CM.Business.Services.OutcomeDocument;

public interface IOutcomeDocContentService : IServiceBase, IDisputeResolver
{
    Task<OutcomeDocContentResponse> CreateAsync(int outcomeDocFileId, OutcomeDocContentPostRequest outcomeDocContent);

    Task<OutcomeDocContent> PatchAsync(OutcomeDocContent outcomeDocContent);

    Task<OutcomeDocContent> GetNoTrackingOutcomeDocContentAsync(int outcomeDocContentId);

    Task<bool> DeleteAsync(int outcomeDocContentId);
}