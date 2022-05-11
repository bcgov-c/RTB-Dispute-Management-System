using System.Threading.Tasks;

namespace CM.Business.Services.DisputeAbandonedForNoService;

public interface IDisputeAbandonedDueToApplicantServiceInactionService
{
    Task<bool> ProcessDisputeAbandonedForNoService();
}