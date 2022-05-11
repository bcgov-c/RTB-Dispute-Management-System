using System.Threading.Tasks;
using CM.Business.Entities.Models.RemedyDetail;
using CM.Business.Services.Base;
using CM.Data.Model;

namespace CM.Business.Services.RemedyDetails;

public interface IRemedyDetailService : IServiceBase, IDisputeResolver
{
    Task<RemedyDetailResponse> CreateAsync(int remedyId, RemedyDetailRequest remedyDetail);

    Task<bool> DeleteAsync(int remedyDetailId);

    Task<RemedyDetail> PatchAsync(RemedyDetail remedy);

    Task<RemedyDetail> GetNoTrackingRemedyDetailAsync(int remedyDetailId);
}