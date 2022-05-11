using System;
using System.Threading.Tasks;

namespace CM.Business.Services.PostedDecisionOutcome;

public interface IPostedDecisionOutcomeService
{
    Task<bool> CreateAsync(Guid disputeGuid, int postedDecisionId);

    Task<bool> DeleteAsync(int postedDecisionOutcomeId);
}