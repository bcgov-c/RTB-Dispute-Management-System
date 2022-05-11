using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.RemedyDetail;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.RemedyDetails;

public class RemedyDetailService : CmServiceBase, IRemedyDetailService
{
    public RemedyDetailService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<Guid> ResolveDisputeGuid(int id)
    {
        var entityRemedyDetail = await UnitOfWork.RemedyDetailRepository.GetNoTrackingByIdAsync(c => c.RemedyDetailId == id);
        if (entityRemedyDetail != null)
        {
            var entityRemedy = await UnitOfWork.RemedyRepository.GetNoTrackingByIdAsync(c => c.RemedyId == entityRemedyDetail.RemedyId);
            if (entityRemedy != null)
            {
                var entityClaim = await UnitOfWork.ClaimRepository.GetNoTrackingByIdAsync(c => c.ClaimId == entityRemedy.ClaimId);
                if (entityClaim != null)
                {
                    var entityClaimGroup = await UnitOfWork.ClaimGroupRepository.GetNoTrackingByIdAsync(c => c.ClaimGroupId == entityClaim.ClaimGroupId);
                    return entityClaimGroup.DisputeGuid;
                }
            }
        }

        return Guid.Empty;
    }

    public async Task<RemedyDetailResponse> CreateAsync(int remedyId, RemedyDetailRequest remedyDetail)
    {
        var newRemedy = MapperService.Map<RemedyDetailRequest, RemedyDetail>(remedyDetail);
        newRemedy.RemedyId = remedyId;
        newRemedy.IsDeleted = false;

        var remedyResult = await UnitOfWork.RemedyDetailRepository.InsertAsync(newRemedy);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<RemedyDetail, RemedyDetailResponse>(remedyResult);
        }

        return null;
    }

    public async Task<bool> DeleteAsync(int remedyDetailId)
    {
        var remedyDetail = await UnitOfWork.RemedyDetailRepository.GetByIdAsync(remedyDetailId);
        if (remedyDetail != null)
        {
            remedyDetail.IsDeleted = true;
            UnitOfWork.RemedyDetailRepository.Attach(remedyDetail);
            var result = await UnitOfWork.Complete();
            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<RemedyDetail> PatchAsync(RemedyDetail remedyDetail)
    {
        UnitOfWork.RemedyDetailRepository.Attach(remedyDetail);
        var result = await UnitOfWork.Complete();

        if (result.CheckSuccess())
        {
            return remedyDetail;
        }

        return null;
    }

    public async Task<RemedyDetail> GetNoTrackingRemedyDetailAsync(int remedyDetailId)
    {
        var remedyDetail = await UnitOfWork.RemedyDetailRepository.GetNoTrackingByIdAsync(
            rd => rd.RemedyDetailId == remedyDetailId);
        return remedyDetail;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object remedyDetailId)
    {
        var lastModifiedDate = await UnitOfWork.RemedyDetailRepository.GetLastModifiedDate((int)remedyDetailId);
        return lastModifiedDate;
    }
}