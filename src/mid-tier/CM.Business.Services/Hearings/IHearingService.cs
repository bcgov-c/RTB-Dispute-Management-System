﻿using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.DisputeHearing;
using CM.Business.Entities.Models.Hearing;

namespace CM.Business.Services.Hearings;

public interface IHearingService : IServiceBase
{
    Task<HearingResponse> CreateAsync(HearingRequest request);

    Task<HearingResponse> PatchAsync(int hearingId, HearingPatchRequest hearingPatchRequest, int hearingOwner);

    Task<HearingPatchRequest> GetForPatchAsync(int hearingId);

    Task<HearingResponse> GetHearingAsync(int hearingId);

    Task<Data.Model.Hearing> GetHearingWithDisputeHearings(int hearingId);

    Task<DisputeHearingGetResponse> GetHearing(int hearingId);

    Task<bool> DeleteAsync(int hearingId);

    Task<bool> HearingOwnerIsValid(int ownerId);

    Task<bool> HearingOwnerIsBlocked(int ownerId, DateTime startTime, DateTime endTime, int hearingId);

    Task<bool> HearingExists(int hearingId);

    Task<List<DisputeHearingGetResponse>> GetDisputeHearingsAsync(Guid disputeGuid);

    Task<List<AvailableStaffResponse>> GetAvailableStaffAsync(HearingAvailableStaffRequest request);

    Task<List<AvailableConferenceBridgesResponse>> GetAvailableBridges(AvailableConferenceBridgesRequest request);

    Task<bool> SwitchHearingOwners(ReassignRequest request);

    Task<bool> MoveDisputeHearings(RescheduleRequest request);

    Task<bool> IsAssignedHearings(int userId, DateTime blockStart);

    Task<List<ReserveAvailableHearingResponse>> ReserveAvailableHearings(ReserveAvailableHearingsRequest request, string token);

    Task<bool> BookReservedHearing(int hearingId, Guid disputeGuid);

    Task<bool> CancelReservedHearing(int hearingId);

    Task<bool> HoldHearing(int hearingId, string token);
}