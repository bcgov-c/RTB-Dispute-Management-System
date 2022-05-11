using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Remedy;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.RemedyServices;

public class RemedyService : CmServiceBase, IRemedyService
{
    public RemedyService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<Guid> ResolveDisputeGuid(int id)
    {
        var entityRemedy = await UnitOfWork.RemedyRepository.GetNoTrackingByIdAsync(c => c.RemedyId == id);
        if (entityRemedy != null)
        {
            var entityClaim = await UnitOfWork.ClaimRepository.GetNoTrackingByIdAsync(c => c.ClaimId == entityRemedy.ClaimId);
            if (entityClaim != null)
            {
                var entityClaimGroup = await UnitOfWork.ClaimGroupRepository.GetNoTrackingByIdAsync(c => c.ClaimGroupId == entityClaim.ClaimGroupId);
                return entityClaimGroup.DisputeGuid;
            }
        }

        return Guid.Empty;
    }

    public async Task<RemedyResponse> CreateAsync(int claimId, RemedyRequest remedy)
    {
        var newRemedy = MapperService.Map<RemedyRequest, Remedy>(remedy);
        newRemedy.ClaimId = claimId;
        newRemedy.IsDeleted = false;

        var remedyResult = await UnitOfWork.RemedyRepository.InsertAsync(newRemedy);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<Remedy, RemedyResponse>(remedyResult);
        }

        return null;
    }

    public async Task<bool> DeleteAsync(int remedyId)
    {
        var remedy = await UnitOfWork.RemedyRepository.GetByIdAsync(remedyId);
        if (remedy != null)
        {
            remedy.IsDeleted = true;
            UnitOfWork.RemedyRepository.Attach(remedy);
            var result = await UnitOfWork.Complete();
            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<Remedy> PatchAsync(Remedy remedy)
    {
        UnitOfWork.RemedyRepository.Attach(remedy);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return remedy;
        }

        return null;
    }

    public async Task<Remedy> GetNoTrackingRemedyAsync(int remedyId)
    {
        var remedy = await UnitOfWork.RemedyRepository.GetNoTrackingByIdAsync(
            r => r.RemedyId == remedyId);
        return remedy;
    }

    public async Task<Remedy> GetRemedyWithChildsAsync(int remedyId)
    {
        var remedy = await UnitOfWork.RemedyRepository.GetRemedyWithChildsAsync(remedyId);
        return remedy;
    }

    public async Task<bool> IfChildElementExist(int remedyId)
    {
        var remedyDetails = await UnitOfWork.RemedyDetailRepository.FindAllAsync(rd => rd.RemedyId == remedyId);
        if (remedyDetails is { Count: > 0 })
        {
            return true;
        }

        return false;
    }

    public async Task<bool> RemedyExists(int remedyId)
    {
        return await UnitOfWork.RemedyRepository.GetByIdAsync(remedyId) != null;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object remedyId)
    {
        var lastModifiedDate = await UnitOfWork.RemedyRepository.GetLastModifiedDate((int)remedyId);

        return lastModifiedDate;
    }

    public async Task<bool> ActiveRemedyExists(int remedyId)
    {
        var isRemedyAssigned = await UnitOfWork.ClaimRepository.IsRemedyAssigned(remedyId);
        return isRemedyAssigned;
    }
}