using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.DisputeHearing;
using CM.Business.Entities.Models.ExternalUpdate;
using CM.Business.Entities.Models.Hearing;
using CM.Business.Services.SystemSettingsService;
using CM.Business.Services.TokenServices;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.Hearings;

public class HearingService : CmServiceBase, IHearingService
{
    private readonly IHearingAuditLogService _hearingAuditLogService;

    public HearingService(IMapper mapper, IUnitOfWork unitOfWork, IHearingAuditLogService hearingAuditLogService, ISystemSettingsService systemSettingsService, ITokenService tokenService)
        : base(unitOfWork, mapper)
    {
        SystemSettingsService = systemSettingsService;
        TokenService = tokenService;
        _hearingAuditLogService = hearingAuditLogService;
    }

    private ISystemSettingsService SystemSettingsService { get; }

    private ITokenService TokenService { get; }

    public async Task<HearingResponse> CreateAsync(HearingRequest request)
    {
        var hearing = MapperService.Map<HearingRequest, Hearing>(request);
        hearing.IsDeleted = false;

        var hearingResult = await UnitOfWork.HearingRepository.InsertAsync(hearing);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            var logRes = await _hearingAuditLogService.CreateAsync(HearingAuditLogCase.CreateHearing, hearingResult, null);

            if (logRes)
            {
                return MapperService.Map<Hearing, HearingResponse>(hearingResult);
            }
        }

        return null;
    }

    public async Task<HearingResponse> PatchAsync(int hearingId, HearingPatchRequest hearingPatchRequest, int hearingOwner)
    {
        var hearingToPatch = await UnitOfWork.HearingRepository.GetNoTrackingByIdAsync(p => p.HearingId == hearingId);
        MapperService.Map(hearingPatchRequest, hearingToPatch);

        UnitOfWork.HearingRepository.Attach(hearingToPatch);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            var hearingAuditLogCase = hearingOwner != 0 ? HearingAuditLogCase.ChangeHearingOwner : HearingAuditLogCase.ChangeHearing;
            var logRes = await _hearingAuditLogService.CreateAsync(hearingAuditLogCase, hearingToPatch, null);

            if (logRes)
            {
                var response = MapperService.Map<Hearing, HearingResponse>(hearingToPatch);
                if (response.HearingReservedDisputeGuid.HasValue)
                {
                    var reservedDispute = await UnitOfWork.DisputeRepository.GetDispute(response.HearingReservedDisputeGuid.Value);
                    response.HearingReservedFileNumber = reservedDispute?.FileNumber;
                }

                return response;
            }
        }

        return null;
    }

    public async Task<Hearing> GetForPatchAsync(int hearingId)
    {
        var hearing = await UnitOfWork.HearingRepository.GetNoTrackingByIdAsync(p => p.HearingId == hearingId);
        return hearing;
    }

    public async Task<HearingResponse> GetHearingAsync(int hearingId)
    {
        var hearing = await UnitOfWork.HearingRepository.GetNoTrackingByIdAsync(p => p.HearingId == hearingId);
        return MapperService.Map<Hearing, HearingResponse>(hearing);
    }

    public async Task<DisputeHearingGetResponse> GetHearing(int hearingId)
    {
        var hearing = await UnitOfWork.HearingRepository.GetHearingWithParticipationList(hearingId);

        if (hearing == null)
        {
            return null;
        }

        var hearingResponse = MapperService.Map<Hearing, DisputeHearingGetResponse>(hearing);

        if (hearingResponse.HearingReservedDisputeGuid.HasValue)
        {
            var dispute = await UnitOfWork.DisputeRepository.GetDispute(hearingResponse.HearingReservedDisputeGuid.Value);
            hearingResponse.HearingReservedFileNumber = dispute.FileNumber;
        }

        var associatedDisputes = await UnitOfWork.DisputeHearingRepository.GetByHearingId(hearing.HearingId);

        hearingResponse.AssociatedDisputes = MapperService.Map<List<Data.Model.DisputeHearing>, List<DisputeHearingResponse>>(associatedDisputes);

        return hearingResponse;
    }

    public async Task<List<DisputeHearingGetResponse>> GetDisputeHearingsAsync(Guid disputeGuid)
    {
        var disputeHearingsResponse = new List<DisputeHearingGetResponse>();

        var disputeHearings = await UnitOfWork.DisputeHearingRepository.GetDisputeHearingsByDispute(disputeGuid);

        foreach (var hearing in disputeHearings)
        {
            var disputeHearing = await GetHearing(hearing.HearingId);

            if (disputeHearing.HearingReservedDisputeGuid.HasValue)
            {
                var dispute = await UnitOfWork.DisputeRepository.GetDispute(disputeHearing.HearingReservedDisputeGuid.Value);
                disputeHearing.HearingReservedFileNumber = dispute.FileNumber;
            }

            disputeHearingsResponse.Add(disputeHearing);
        }

        return disputeHearingsResponse;
    }

    public async Task<bool> DeleteAsync(int hearingId)
    {
        var hearing = await UnitOfWork.HearingRepository.GetByIdAsync(hearingId);
        if (hearing != null)
        {
            hearing.IsDeleted = true;
            UnitOfWork.HearingRepository.Attach(hearing);
            var result = await UnitOfWork.Complete();

            if (result.CheckSuccess())
            {
                var logRes = await _hearingAuditLogService.CreateAsync(HearingAuditLogCase.DeleteHearing, hearing, null);

                if (logRes)
                {
                    return true;
                }
            }
        }

        return false;
    }

    public async Task<bool> HearingOwnerIsValid(int ownerId)
    {
        var userIsArbitrator = false;
        var user = await UnitOfWork.SystemUserRepository.GetUserWithInternalRolesAsync(ownerId);
        if (user != null)
        {
            userIsArbitrator = user.InternalUserRoles.Any(r => r.RoleGroupId == (byte)RoleGroup.Arbitrator);
        }

        return userIsArbitrator;
    }

    public async Task<bool> HearingOwnerIsBlocked(int ownerId, DateTime startTime, DateTime endTime, int hearingId)
    {
        var hearings =
            await UnitOfWork.HearingRepository.FindAllAsync(s => s.HearingOwner == ownerId && s.HearingId != hearingId);
        if (hearings != null)
        {
            foreach (var hearing in hearings)
            {
                if (startTime < hearing.HearingStartDateTime && endTime > hearing.HearingStartDateTime)
                {
                    return true;
                }

                if (startTime < hearing.HearingEndDateTime && endTime > hearing.HearingStartDateTime)
                {
                    return true;
                }
            }
        }

        return false;
    }

    public async Task<bool> HearingExists(int hearingId)
    {
        var hearing = await UnitOfWork.HearingRepository.GetByIdAsync(hearingId);
        return hearing != null;
    }

    public async Task<List<AvailableStaffResponse>> GetAvailableStaffAsync(HearingAvailableStaffRequest request)
    {
        var availableUsers = await UnitOfWork.SystemUserRepository.GetAvailableUsersAsync(request.RoleGroup, request.RoleSubgroup);

        var availableStaff = await UnitOfWork.HearingRepository.GetAvailableStaff(request, availableUsers);

        return availableStaff;
    }

    public async Task<List<AvailableConferenceBridgesResponse>> GetAvailableBridges(AvailableConferenceBridgesRequest request)
    {
        var availableConferenceBridges = await UnitOfWork.HearingRepository.GetAvailableHearingsByPeriod(request);

        return availableConferenceBridges;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        var lastModifiedDate = await UnitOfWork.HearingRepository.GetLastModifiedDate((int)id);
        return lastModifiedDate;
    }

    public async Task<bool> SwitchHearingOwners(ReassignRequest request)
    {
        var firstHearing = await UnitOfWork.HearingRepository.GetByIdAsync(request.FirstHearingId);
        var secondHearing = await UnitOfWork.HearingRepository.GetByIdAsync(request.SecondHearingId);

        var tempOwner = firstHearing.HearingOwner;

        if ((firstHearing.HearingPriority == (byte)HearingPriority.Duty || secondHearing.HearingPriority == (byte)HearingPriority.Duty) &&
            firstHearing.HearingPriority != secondHearing.HearingPriority)
        {
            if (firstHearing.HearingPriority == (byte)HearingPriority.Duty)
            {
                firstHearing.HearingPriority = (byte)HearingPriority.Standard;
                secondHearing.HearingPriority = (byte)HearingPriority.Duty;
            }
            else
            {
                firstHearing.HearingPriority = (byte)HearingPriority.Duty;
                secondHearing.HearingPriority = (byte)HearingPriority.Standard;
            }

            await _hearingAuditLogService.CreateAsync(HearingAuditLogCase.ChangeHearing, firstHearing, null, false);
            await _hearingAuditLogService.CreateAsync(HearingAuditLogCase.ChangeHearing, secondHearing, null, false);
        }

        firstHearing.HearingOwner = secondHearing.HearingOwner;
        secondHearing.HearingOwner = tempOwner;

        UnitOfWork.HearingRepository.Attach(firstHearing);
        UnitOfWork.HearingRepository.Attach(secondHearing);

        var result = await UnitOfWork.Complete();

        if (result.CheckSuccess())
        {
            var logResFirst = await _hearingAuditLogService.CreateAsync(HearingAuditLogCase.ChangeHearingOwner, firstHearing, null);
            var logResSecond = await _hearingAuditLogService.CreateAsync(HearingAuditLogCase.ChangeHearingOwner, secondHearing, null);

            if (logResFirst && logResSecond)
            {
                return true;
            }
        }

        return false;
    }

    public async Task<bool> MoveDisputeHearings(RescheduleRequest request)
    {
        var firstHearing = await UnitOfWork.HearingRepository.GetByIdAsync(request.FirstHearingId);
        var secondHearing = await UnitOfWork.HearingRepository.GetByIdAsync(request.SecondHearingId);

        if (firstHearing.HearingPriority != secondHearing.HearingPriority)
        {
            Debug.Assert(firstHearing.HearingPriority != null, "firstHearing.HearingPriority != null");
            var tempPriority = (byte)firstHearing.HearingPriority;
            firstHearing.HearingPriority = secondHearing.HearingPriority;
            secondHearing.HearingPriority = tempPriority;

            await _hearingAuditLogService.CreateAsync(HearingAuditLogCase.ChangeHearing, firstHearing, null, false);
            await _hearingAuditLogService.CreateAsync(HearingAuditLogCase.ChangeHearing, secondHearing, null, false);
        }

        var firstDisputeHearings = await UnitOfWork.DisputeHearingRepository.GetHearingDisputes(request.FirstHearingId);

        foreach (var disputeHearing in firstDisputeHearings)
        {
            var newDisputeHearing = new Data.Model.DisputeHearing
            {
                HearingId = request.SecondHearingId,
                DisputeGuid = disputeHearing.DisputeGuid,
                ExternalFileId = disputeHearing.ExternalFileId,
                DisputeHearingRole = disputeHearing.DisputeHearingRole,
                SharedHearingLinkType = disputeHearing.SharedHearingLinkType,
                DisputeHearingStatus = disputeHearing.DisputeHearingStatus,
                IsDeleted = false
            };

            await UnitOfWork.DisputeHearingRepository.InsertAsync(newDisputeHearing);
            await UnitOfWork.DisputeHearingRepository.Delete(disputeHearing.DisputeHearingId);

            await _hearingAuditLogService.CreateAsync(HearingAuditLogCase.CreateDisputeHearing, null, newDisputeHearing, false);
            await _hearingAuditLogService.CreateAsync(HearingAuditLogCase.DeleteDisputeHearing, firstHearing, disputeHearing, false);
        }

        if (firstHearing.NotificationFileDescriptionId.HasValue)
        {
            var fileDescription = await UnitOfWork.FileDescriptionRepository.GetByIdAsync(firstHearing.NotificationFileDescriptionId.Value);
            if (fileDescription != null)
            {
                fileDescription.IsDeficient = true;
                fileDescription.IsDeficientReason = ConstantStrings.DeficientReason;
                UnitOfWork.FileDescriptionRepository.Attach(fileDescription);
            }

            firstHearing.NotificationFileDescriptionId = null;
            UnitOfWork.HearingRepository.Attach(firstHearing);
        }

        UnitOfWork.HearingRepository.Attach(firstHearing);
        UnitOfWork.HearingRepository.Attach(secondHearing);

        var result = await UnitOfWork.Complete();

        return result.CheckSuccess();
    }

    public async Task<bool> IsAssignedHearings(int userId, DateTime blockStart, DateTime blockEnd)
    {
        var associatedHearingsCount = await UnitOfWork.HearingRepository.GetAssociatedHearingsCount(blockStart, blockEnd, userId);
        return associatedHearingsCount > 0;
    }

    public async Task<List<ReserveAvailableHearingResponse>> ReserveAvailableHearings(ReserveAvailableHearingsRequest request, string token, Guid? disputeGuid)
    {
        var hearings = await UnitOfWork.HearingRepository.GetReserveAvailableHearings(request);

        if (hearings.Count > 0)
        {
            var hearingReservationDuration = await SystemSettingsService.GetValueAsync<int>(SettingKeys.HearingReservationDuration);
            var now = DateTime.UtcNow;
            var userToken = await TokenService.GetUserToken(token);

            foreach (var hearing in hearings)
            {
                hearing.HearingReservedUntil = now.AddMinutes(hearingReservationDuration);
                hearing.HearingReservedById = userToken.UserTokenId;
                hearing.HearingReservedDisputeGuid = disputeGuid;
                UnitOfWork.HearingRepository.Attach(hearing);

                await _hearingAuditLogService.CreateAsync(HearingAuditLogCase.HearingReservation, hearing, null, false);
            }

            var result = await UnitOfWork.Complete();

            if (result.CheckSuccess())
            {
                return MapperService.Map<List<Hearing>, List<ReserveAvailableHearingResponse>>(hearings);
            }
        }

        return new List<ReserveAvailableHearingResponse>();
    }

    public async Task<bool> BookReservedHearing(int hearingId, Guid disputeGuid)
    {
        var disputeHearing = new Data.Model.DisputeHearing
        {
            HearingId = hearingId,
            DisputeGuid = disputeGuid,
            DisputeHearingRole = (byte)DisputeHearingRole.Active,
            SharedHearingLinkType = (byte)SharedHearingLinkType.Single,
            IsDeleted = false
        };

        var disputeHearingResult = await UnitOfWork.DisputeHearingRepository.InsertAsync(disputeHearing);

        var hearing = await UnitOfWork.HearingRepository.GetByIdAsync(hearingId);
        hearing.HearingReservedDisputeGuid = null;
        UnitOfWork.HearingRepository.Attach(hearing);

        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            var logRes = await _hearingAuditLogService.CreateAsync(HearingAuditLogCase.HearingBook, null, disputeHearingResult);

            if (logRes)
            {
                return true;
            }
        }

        return false;
    }

    public async Task<bool> CancelReservedHearing(int hearingId)
    {
        var hearing = await UnitOfWork.HearingRepository.GetByIdAsync(hearingId);
        hearing.HearingReservedUntil = null;
        hearing.HearingReservedById = null;
        hearing.HearingReservedDisputeGuid = null;

        UnitOfWork.HearingRepository.Attach(hearing);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            var logRes = await _hearingAuditLogService.CreateAsync(HearingAuditLogCase.HearingCancel, hearing, null);
            return logRes;
        }

        return false;
    }

    public async Task<Hearing> GetHearingWithDisputeHearings(int hearingId)
    {
        var hearing = await UnitOfWork
            .HearingRepository
            .GetWithDisputeHearings(hearingId);

        return hearing;
    }

    public async Task<bool> HoldHearing(int hearingId, string token, HoldHearingRequest request)
    {
        var userToken = await TokenService.GetUserToken(token);

        var hearing = await UnitOfWork.HearingRepository.GetByIdAsync(hearingId);

        hearing.HearingReservedUntil = request.HearingReservedUntil.HasValue ?
                                        request.HearingReservedUntil.Value :
                                        hearing.HearingStartDateTime;

        hearing.HearingReservedById = userToken.UserTokenId;
        if (request.HearingReservedDisputeGuid.HasValue)
        {
            hearing.HearingReservedDisputeGuid = request.HearingReservedDisputeGuid.Value;
        }

        UnitOfWork.HearingRepository.Attach(hearing);
        var result = await UnitOfWork.Complete();

        if (result.CheckSuccess())
        {
            var logRes = await _hearingAuditLogService.CreateAsync(HearingAuditLogCase.HoldHearing, hearing, null);
            return logRes;
        }

        return false;
    }

    public async Task<int?> GetHearingWaitTime(ExternalHearingWaitTimeRequest request)
    {
        var waitTime = await UnitOfWork.HearingRepository.GetHearingWaitTime(request);
        return waitTime;
    }

    public async Task<OnHoldHearingsGetResponse> GetOnHoldHearings(OnHoldHearingsRequest request, int index, int count)
    {
        if (count == 0)
        {
            count = Pagination.DefaultPageSize;
        }

        var response = new OnHoldHearingsGetResponse();
        var hearings = await UnitOfWork.HearingRepository.GetOnHoldHearings(request);

        response.TotalAvailableRecords = hearings.Count;
        var finalHearings = hearings.ApplyPaging(count, index);

        var mappedHearings = MapperService.Map<List<Hearing>, List<OnHoldHearingResponse>>(finalHearings);

        foreach (var item in mappedHearings)
        {
            if (item.HearingReservedDisputeGuid.HasValue)
            {
                var reservedDispute = await UnitOfWork.DisputeRepository.GetDispute(item.HearingReservedDisputeGuid.Value);
                item.HearingReservedFileNumber = reservedDispute?.FileNumber;
            }
        }

        response.AvailableHearings = mappedHearings;

        return response;
    }

    public async Task<List<ExternalDisputeHearingGetResponse>> GetExternalDisputeHearings(Guid disputeGuid)
    {
        var disputeHearingsResponse = new List<ExternalDisputeHearingGetResponse>();

        var disputeHearings = await UnitOfWork.DisputeHearingRepository.GetDisputeHearingsByDispute(disputeGuid);

        foreach (var hearing in disputeHearings)
        {
            var disputeHearing = await GetExternalHearing(hearing.HearingId);

            disputeHearingsResponse.Add(disputeHearing);
        }

        return disputeHearingsResponse;
    }

    public async Task<ExternalDisputeHearingGetResponse> GetExternalHearing(int hearingId)
    {
        var hearing = await UnitOfWork.HearingRepository.GetHearingWithConferenceBridge(hearingId);

        if (hearing == null)
        {
            return null;
        }

        var hearingResponse = MapperService.Map<Hearing, ExternalDisputeHearingGetResponse>(hearing);

        var associatedDisputes = await UnitOfWork.DisputeHearingRepository.GetByHearingId(hearing.HearingId);

        hearingResponse.AssociatedDisputes = MapperService.Map<List<Data.Model.DisputeHearing>, List<ExternalDisputeHearingResponse>>(associatedDisputes);

        return hearingResponse;
    }
}