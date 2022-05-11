using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.DisputeFlag;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.DisputeFlag;

public class DisputeFlagService : CmServiceBase, IDisputeFlagService
{
    public DisputeFlagService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<PostDisputeFlagResponse> CreateAsync(Guid disputeGuid, PostDisputeFlagRequest request)
    {
        var disputeFlag = MapperService.Map<PostDisputeFlagRequest, Data.Model.DisputeFlag>(request);
        disputeFlag.Dispute = await UnitOfWork.DisputeRepository.GetDispute(disputeGuid);
        disputeFlag.IsDeleted = false;

        var disputeFlagResult = await UnitOfWork.DisputeFlagRepository.InsertAsync(disputeFlag);
        var result = await UnitOfWork.Complete();

        if (result.CheckSuccess())
        {
            var res = MapperService.Map<Data.Model.DisputeFlag, PostDisputeFlagResponse>(disputeFlagResult);
            res.FileNumber = disputeFlag.Dispute.FileNumber;
            return res;
        }

        return null;
    }

    public async Task<bool> DeleteAsync(int disputeFlagId)
    {
        var disputeFlag = await UnitOfWork.DisputeFlagRepository.GetByIdAsync(disputeFlagId);
        if (disputeFlag != null)
        {
            disputeFlag.IsDeleted = true;
            UnitOfWork.DisputeFlagRepository.Attach(disputeFlag);
            var result = await UnitOfWork.Complete();
            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<PostDisputeFlagResponse> GetAsync(int disputeFlagId)
    {
        var disputeFlag = await UnitOfWork.DisputeFlagRepository.GetFlagWithDispute(disputeFlagId);
        if (disputeFlag != null)
        {
            var res = MapperService.Map<Data.Model.DisputeFlag, PostDisputeFlagResponse>(disputeFlag);
            return res;
        }

        return null;
    }

    public async Task<Data.Model.DisputeFlag> GetById(int disputeFlagId)
    {
        var disputeFlag = await UnitOfWork.DisputeFlagRepository.GetByIdAsync(disputeFlagId);
        return disputeFlag;
    }

    public async Task<PatchDisputeFlagRequest> GetForPatchAsync(int disputeFlagId)
    {
        var disputeFlagToPatch = await UnitOfWork.DisputeFlagRepository.GetNoTrackingByIdAsync(
            c => c.DisputeFlagId == disputeFlagId);
        return MapperService.Map<Data.Model.DisputeFlag, PatchDisputeFlagRequest>(disputeFlagToPatch);
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        var lastModifiedDate = await UnitOfWork.DisputeFlagRepository.GetLastModifiedDate((int)id);
        return lastModifiedDate;
    }

    public async Task<List<PostDisputeFlagResponse>> GetLinkedFlags(Guid disputeGuid)
    {
        var guidList = new List<Guid?> { disputeGuid };

        var latestHearing = await UnitOfWork.DisputeHearingRepository.GetLatestDisputeHearing(disputeGuid);

        if (latestHearing != null)
        {
            var disputeHearings = await UnitOfWork.DisputeHearingRepository
                .FindAllAsync(x => x.HearingId == latestHearing.HearingId);

            var disputeGuids = disputeHearings
                .Select(x => x.DisputeGuid)
                .ToList();

            guidList.AddRange(disputeGuids);
        }

        var disputeFlags = await UnitOfWork.DisputeFlagRepository.GetFlagsByGuidList(guidList);

        return MapperService.Map<List<Data.Model.DisputeFlag>, List<PostDisputeFlagResponse>>(disputeFlags.ToList());
    }

    public async Task<List<PostDisputeFlagResponse>> GetLinkedFlagsFromHearing(Hearing latestHearing, Guid disputeGuid)
    {
        var guidList = new List<Guid?> { disputeGuid };

        if (latestHearing != null)
        {
            var disputeHearings = await UnitOfWork.DisputeHearingRepository
                .FindAllAsync(x => x.HearingId == latestHearing.HearingId);

            var disputeGuids = disputeHearings
                .Select(x => x.DisputeGuid)
                .ToList();

            guidList.AddRange(disputeGuids);
        }

        var disputeFlags = await UnitOfWork.DisputeFlagRepository.GetFlagsByGuidList(guidList);

        return MapperService.Map<List<Data.Model.DisputeFlag>, List<PostDisputeFlagResponse>>(disputeFlags.ToList());
    }

    public async Task<List<PostDisputeFlagResponse>> GetList(Guid disputeGuid)
    {
        var disputeFlagList = await UnitOfWork.DisputeFlagRepository.GetByDisputeGuid(disputeGuid);
        if (disputeFlagList != null)
        {
            return MapperService.Map<List<Data.Model.DisputeFlag>, List<PostDisputeFlagResponse>>(disputeFlagList);
        }

        return null;
    }

    public async Task<PostDisputeFlagResponse> PatchAsync(int disputeFlagId, PatchDisputeFlagRequest disputeFlagRequest)
    {
        var disputeFlag = await UnitOfWork.DisputeFlagRepository.GetFlagWithDispute(disputeFlagId);
        MapperService.Map(disputeFlagRequest, disputeFlag);

        UnitOfWork.DisputeFlagRepository.Attach(disputeFlag);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            var res = MapperService.Map<Data.Model.DisputeFlag, PostDisputeFlagResponse>(disputeFlag);

            return res;
        }

        return null;
    }

    public async Task<Guid> ResolveDisputeGuid(int id)
    {
        var entity = await UnitOfWork.DisputeFlagRepository.GetNoTrackingByIdAsync(x => x.DisputeFlagId == id);
        return entity?.DisputeGuid ?? Guid.Empty;
    }
}