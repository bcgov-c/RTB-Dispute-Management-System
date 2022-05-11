using System;
using System.Threading.Tasks;
using CM.Business.Entities.Models.PostedDecision;

namespace CM.Business.Services.PostedDecision;

public interface IPostedDecisionService : IServiceBase
{
    Task<bool> CreateAsync(Guid disputeGuid, int outcomeDocFileId);

    Task<bool> DeleteAsync(int postedDecisionId);

    Task<PostedDecisionSearchResponse> SearchAsync(PostedDecisionSearchRequest request, int count, int index);
}