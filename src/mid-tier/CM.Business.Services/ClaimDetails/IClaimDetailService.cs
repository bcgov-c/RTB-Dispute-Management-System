using System.Threading.Tasks;
using CM.Business.Entities.Models.ClaimDetail;
using CM.Business.Services.Base;

namespace CM.Business.Services.ClaimDetails;

public interface IClaimDetailService : IServiceBase, IDisputeResolver
{
    Task<ClaimDetailResponse> CreateAsync(int claimId, ClaimDetailRequest claimDetail);

    Task<bool> DeleteAsync(int claimDetailId);

    Task<ClaimDetailResponse> PatchAsync(int claimDetailId, ClaimDetailRequest claimDetailRequest);

    Task<ClaimDetailRequest> GetForPatchAsync(int claimDetailId);
}