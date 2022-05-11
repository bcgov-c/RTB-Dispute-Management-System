using System.Threading.Tasks;
using CM.Business.Entities.Models.AccessCode;
using CM.Data.Model;

namespace CM.Business.Services.DisputeAccess;

public interface IDisputeAccessService
{
    Task<DisputeAccessResponse> GatherDisputeData(Dispute dispute, bool includeNonDeliveredOutcomeDocs = true);
}