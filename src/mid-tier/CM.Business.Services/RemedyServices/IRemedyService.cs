using System.Threading.Tasks;
using CM.Business.Entities.Models.Remedy;
using CM.Business.Services.Base;
using CM.Data.Model;

namespace CM.Business.Services.RemedyServices;

public interface IRemedyService : IServiceBase, IDisputeResolver
{
    Task<RemedyResponse> CreateAsync(int claimId, RemedyRequest remedy);

    Task<bool> DeleteAsync(int remedyId);

    Task<Remedy> PatchAsync(Remedy remedy);

    Task<Remedy> GetNoTrackingRemedyAsync(int remedyId);

    Task<bool> IfChildElementExist(int remedyId);

    Task<bool> RemedyExists(int remedyId);

    Task<bool> ActiveRemedyExists(int remedyId);

    Task<Remedy> GetRemedyWithChildsAsync(int remedyId);
}