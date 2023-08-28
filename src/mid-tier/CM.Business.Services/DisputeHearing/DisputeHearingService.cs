using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.DisputeHearing;
using CM.Business.Services.Hearings;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.DisputeHearing;

public class DisputeHearingService : CmServiceBase, IDisputeHearingService
{
    private readonly IHearingAuditLogService _hearingAuditLogService;
    private readonly IHearingService _hearingService;

    public DisputeHearingService(IMapper mapper, IUnitOfWork unitOfWork, IHearingAuditLogService hearingAuditLogService, IHearingService hearingService)
        : base(unitOfWork, mapper)
    {
        _hearingAuditLogService = hearingAuditLogService;
        _hearingService = hearingService;
    }

    public async Task<DisputeHearingResponse> CreateAsync(DisputeHearingRequest request)
    {
        var disputeHearing = MapperService.Map<DisputeHearingRequest, Data.Model.DisputeHearing>(request);
        disputeHearing.IsDeleted = false;

        var disputeHearingResult = await UnitOfWork.DisputeHearingRepository.InsertAsync(disputeHearing);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            var logRes = await _hearingAuditLogService.CreateAsync(HearingAuditLogCase.CreateDisputeHearing, null, disputeHearingResult);

            if (logRes)
            {
                return MapperService.Map<Data.Model.DisputeHearing, DisputeHearingResponse>(disputeHearingResult);
            }
        }

        return null;
    }

    public async Task<DisputeHearingResponse> PatchAsync(Data.Model.DisputeHearing disputeHearing)
    {
        UnitOfWork.DisputeHearingRepository.Attach(disputeHearing);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            var dispute = disputeHearing.DisputeGuid.HasValue ? await UnitOfWork.DisputeRepository.GetDisputeByGuidAsync(disputeHearing.DisputeGuid.Value) : null;
            disputeHearing.Dispute = dispute;

            var logRes = await _hearingAuditLogService.CreateAsync(HearingAuditLogCase.ChangeDisputeHearing, null, disputeHearing);

            if (logRes)
            {
                return MapperService.Map<Data.Model.DisputeHearing, DisputeHearingResponse>(disputeHearing);
            }
        }

        return null;
    }

    public async Task<Data.Model.DisputeHearing> GetNoTrackingAsync(int disputeHearingId)
    {
        var disputeHearing = await UnitOfWork.DisputeHearingRepository.GetNoTrackingByIdAsync(
            c => c.DisputeHearingId == disputeHearingId);
        return disputeHearing;
    }

    public async Task<bool> DeleteAsync(int disputeHearingId)
    {
        var disputeHearing = await UnitOfWork.DisputeHearingRepository.GetByIdAsync(disputeHearingId);
        if (disputeHearing != null)
        {
            disputeHearing.IsDeleted = true;
            UnitOfWork.DisputeHearingRepository.Attach(disputeHearing);
            var result = await UnitOfWork.Complete();
            if (result.CheckSuccess())
            {
                await _hearingAuditLogService.CreateAsync(HearingAuditLogCase.DeleteDisputeHearing, null, disputeHearing);

                return true;
            }
        }

        return false;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        var lastModifiedDate = await UnitOfWork.DisputeHearingRepository.GetLastModifiedDate((int)id);
        return lastModifiedDate;
    }

    public async Task<Data.Model.DisputeHearing> GetPrimaryHearing(int hearingId)
    {
        var disputeHearings = await
            UnitOfWork.DisputeHearingRepository.FindAllAsync(d =>
                d.HearingId == hearingId);

        return disputeHearings?.FirstOrDefault(disputeHearing => disputeHearing.DisputeHearingRole == (byte)DisputeHearingRole.Active);
    }

    public async Task<List<DisputeHearingResponse>> GetDisputeHearingHistory(byte searchType, Guid? disputeGuid, int? hearingId, int index, int count)
    {
        if (count == 0)
        {
            count = Pagination.DefaultPageSize;
        }

        var result = await UnitOfWork.DisputeHearingRepository.GetDisputeHearingHistory(searchType, disputeGuid, hearingId, index, count);
        return MapperService.Map<List<Data.Model.DisputeHearing>, List<DisputeHearingResponse>>(result);
    }

    public async Task<bool> IsFutureHearingExist(Guid disputeGuid)
    {
        var isExist = await UnitOfWork.DisputeHearingRepository.IsFutureHearingExist(disputeGuid);
        return isExist;
    }

    public async Task<bool> IsOverlappedHearingExist(Guid disputeGuid, int hearingId)
    {
        var isExist = await UnitOfWork.DisputeHearingRepository.IsOverlappedHearingExist(disputeGuid, hearingId);
        return isExist;
    }

    public async Task<List<Data.Model.DisputeHearing>> GetDisputeHearingsByHearing(int hearingId)
    {
        var disputeHearings = await UnitOfWork.DisputeHearingRepository.GetByHearingId(hearingId);

        return disputeHearings;
    }

    public async Task<Data.Model.DisputeHearing> FindRecordingHearing(string recordCode, DateTime startDate)
    {
        var disputeHearing = await UnitOfWork.DisputeHearingRepository.GetHearingByRecordCodeAndDate(recordCode, startDate);
        return disputeHearing;
    }

    public async Task<List<Data.Model.DisputeHearing>> GetDisputeHearings(Guid disputeGuid)
    {
        var disputeHearings = await UnitOfWork.DisputeHearingRepository.GetDisputeHearings(disputeGuid);
        return disputeHearings;
    }

    public async Task<DisputeHearingGetResponse> LinkPastHearing(Guid staticDisputeGuid, Guid movedDisputeGuid)
    {
        var movedDisputeHearings = await UnitOfWork.DisputeHearingRepository.GetDisputeHearings(movedDisputeGuid);
        var movedDisputeHearing = movedDisputeHearings.OrderByDescending(x => x.Hearing.HearingStartDateTime).FirstOrDefault();
        await DeleteAsync(movedDisputeHearing.DisputeHearingId);

        var staticDisputeHearings = await UnitOfWork.DisputeHearingRepository.GetDisputeHearings(staticDisputeGuid);
        var staticDisputeHearing = staticDisputeHearings.OrderByDescending(x => x.Hearing.HearingStartDateTime).FirstOrDefault();

        await CreateAsync(new DisputeHearingRequest()
        {
            DisputeGuid = movedDisputeGuid,
            HearingId = staticDisputeHearing.HearingId,
            DisputeHearingRole = (byte)DisputeHearingRole.Secondary,
            SharedHearingLinkType = (byte)SharedHearingLinkType.Cross
        });

        staticDisputeHearing.SharedHearingLinkType = (byte)SharedHearingLinkType.Cross;
        staticDisputeHearing.DisputeHearingRole = (byte)DisputeHearingRole.Active;
        await PatchAsync(staticDisputeHearing);

        return await _hearingService.GetHearing(staticDisputeHearing.HearingId);
    }

    public async Task<bool> IsExistedDisputeHearing(int? hearingId, Guid disputeGuid)
    {
        var isExisted = await UnitOfWork.DisputeHearingRepository.IsExists(hearingId, disputeGuid);
        return isExisted;
    }
}