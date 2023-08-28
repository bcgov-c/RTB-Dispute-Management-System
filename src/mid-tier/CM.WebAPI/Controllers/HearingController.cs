using System;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Hearing;
using CM.Business.Services.ConferenceBridge;
using CM.Business.Services.DisputeHearing;
using CM.Business.Services.DisputeServices;
using CM.Business.Services.Files;
using CM.Business.Services.Hearings;
using CM.Business.Services.SystemSettingsService;
using CM.Business.Services.TokenServices;
using CM.Business.Services.UserServices;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.WebAPI.Filters;
using CM.WebAPI.WebApiHelpers;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
public class HearingController : BaseController
{
    private const int FromMinDate = 7;
    private readonly IConferenceBridgeService _conferenceBridgeService;
    private readonly IDisputeHearingService _disputeHearingService;
    private readonly IDisputeService _disputeService;
    private readonly IFileDescriptionService _fileDescriptionService;

    private readonly IHearingService _hearingService;
    private readonly ISystemSettingsService _systemSettingsService;

    private readonly ITokenService _tokenService;
    private readonly IUserService _userService;
    private readonly IMapper _mapper;

    public HearingController(
        IHearingService hearingService,
        IUserService userService,
        IDisputeService disputeService,
        IConferenceBridgeService conferenceBridgeService,
        IDisputeHearingService disputeHearingService,
        ISystemSettingsService systemSettingsService,
        ITokenService tokenService,
        IFileDescriptionService fileDescriptionService,
        IMapper mapper)
    {
        _hearingService = hearingService;
        _userService = userService;
        _conferenceBridgeService = conferenceBridgeService;
        _disputeHearingService = disputeHearingService;
        _disputeService = disputeService;
        _systemSettingsService = systemSettingsService;
        _tokenService = tokenService;
        _fileDescriptionService = fileDescriptionService;
        _mapper = mapper;
    }

    [AuthorizationRequired(new[] { RoleNames.Admin })]
    [HttpPost("api/hearing")]
    public async Task<IActionResult> Post([FromBody]HearingRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var duration = request.LocalEndDateTime - request.LocalStartDateTime;
        if (duration.Hours > Constants.HearingDuration)
        {
            return BadRequest(ApiReturnMessages.DurationIsNotValid);
        }

        var validationResult = await ValidatePostRequest(request, -1);
        if (validationResult.GetType() != typeof(OkResult))
        {
            return validationResult;
        }

        var result = await _hearingService.CreateAsync(request);
        EntityIdSetContext(result.HearingId);
        return Ok(result);
    }

    [AuthorizationRequired(new[] { RoleNames.Admin })]
    [ApplyConcurrencyCheck]
    [HttpPatch("api/hearing/{hearingId:int}")]
    public async Task<IActionResult> Patch(int hearingId, [FromBody]JsonPatchDocumentExtension<HearingPatchRequest> request)
    {
        if (CheckModified(_hearingService, hearingId))
        {
            return StatusConflicted();
        }

        var hearing = await _hearingService.GetForPatchAsync(hearingId);
        var hearingToPatch = _mapper.Map<Hearing, HearingPatchRequest>(hearing);
        if (hearingToPatch != null)
        {
            request.ApplyTo(hearingToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var validationResult = await ValidatePatchRequest(hearingToPatch, hearingId, hearing);
            if (validationResult.GetType() != typeof(OkResult))
            {
                return validationResult;
            }

            var(fileDescExists, fileDescValue) = request.GetValue<int?>("/notification_file_description_id");
            if (fileDescExists && fileDescValue.HasValue)
            {
                var fileDescription = await _fileDescriptionService.GetAsync(fileDescValue.Value);
                var disputeHearings = await _disputeHearingService.GetDisputeHearingsByHearing(hearingId);
                if (disputeHearings == null || disputeHearings.Count == 0)
                {
                    return BadRequest(ApiReturnMessages.EmptyDisputeHearings);
                }

                var disputeGuid = disputeHearings
                    .FirstOrDefault(x => x.DisputeHearingRole == (byte)DisputeHearingRole.Active)
                    .DisputeGuid;

                if (fileDescription == null || fileDescription.DisputeGuid != disputeGuid)
                {
                    return BadRequest(ApiReturnMessages.InvalidFileDescription);
                }
            }

            var(exists, value) = request.GetValue<int>("/hearing_owner");
            var hearingOwnerId = exists ? value : 0;
            var result = await _hearingService.PatchAsync(hearingId, hearingToPatch, hearingOwnerId);

            if (result != null)
            {
                EntityIdSetContext(hearingId);
                return Ok(result);
            }
        }

        return NotFound();
    }

    [AuthorizationRequired(new[] { RoleNames.ExtendedAdmin })]
    [ApplyConcurrencyCheck]
    [HttpDelete("api/hearing/{hearingId:int}")]
    public async Task<IActionResult> Delete(int hearingId)
    {
        if (CheckModified(_hearingService, hearingId))
        {
            return StatusConflicted();
        }

        var disputeHearings = await _disputeHearingService.GetDisputeHearingsByHearing(hearingId);
        if (disputeHearings.Count > 0)
        {
            return BadRequest(string.Format(ApiReturnMessages.AssociatedDisputeHearing, disputeHearings[0].DisputeHearingId));
        }

        var hearing = await _hearingService.GetHearingAsync(hearingId);
        if (hearing.HearingReservedUntil.HasValue && hearing.HearingReservedUntil >= DateTime.UtcNow)
        {
            return BadRequest(ApiReturnMessages.DeleteReservedHearing);
        }

        var result = await _hearingService.DeleteAsync(hearingId);
        if (result)
        {
            EntityIdSetContext(hearingId);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }

    [HttpGet("api/hearing/{hearingId:int}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> Get(int hearingId)
    {
        var hearing = await _hearingService.GetHearing(hearingId);
        if (hearing != null)
        {
            return Ok(hearing);
        }

        return NotFound();
    }

    [AuthorizationRequired(new[] { RoleNames.ExtendedAdmin })]
    [HttpGet("api/availablestaff")]
    public async Task<IActionResult> GetAvailableStaff(HearingAvailableStaffRequest request)
    {
        if (request.LocalStartDatetime.Date != request.LocalEndDatetime.Date)
        {
            return BadRequest(ApiReturnMessages.DatePartShouldBeTheSameValue);
        }

        var hearingAvailableStaff = await _hearingService.GetAvailableStaffAsync(request);
        if (hearingAvailableStaff != null)
        {
            return Ok(hearingAvailableStaff);
        }

        return NotFound();
    }

    [AuthorizationRequired(new[] { RoleNames.ExtendedAdmin })]
    [HttpGet("api/availableconferencebridges")]
    public async Task<IActionResult> GetAvailableConferenceBridges(AvailableConferenceBridgesRequest request)
    {
        if (request.LocalStartDatetime.Date != request.LocalEndDatetime.Date)
        {
            return BadRequest(ApiReturnMessages.DatePartShouldBeTheSameValue);
        }

        var availableConferenceBridges = await _hearingService.GetAvailableBridges(request);
        if (availableConferenceBridges != null)
        {
            return Ok(availableConferenceBridges);
        }

        return NotFound();
    }

    [AuthorizationRequired(new[] { RoleNames.ExtendedAdmin })]
    [HttpPost("api/hearing/reassign")]
    public async Task<IActionResult> Reassign([FromBody]ReassignRequest request)
    {
        var now = DateTime.UtcNow;

        var firstHearing = await _hearingService.GetHearingAsync(request.FirstHearingId);
        var secondHearing = await _hearingService.GetHearingAsync(request.SecondHearingId);

        var firstHearingStartDateTime = DateTime.Parse(firstHearing.HearingEndDateTime, styles: DateTimeStyles.AdjustToUniversal);
        if (firstHearingStartDateTime <= now)
        {
            return BadRequest(string.Format(ApiReturnMessages.InvalidHearingForSwitch, request.FirstHearingId));
        }

        var secondHearingStartDateTime = DateTime.Parse(secondHearing.HearingEndDateTime, styles: DateTimeStyles.AdjustToUniversal);
        if (secondHearingStartDateTime <= now)
        {
            return BadRequest(string.Format(ApiReturnMessages.InvalidHearingForSwitch, request.SecondHearingId));
        }

        if (firstHearing.HearingStartDateTime != secondHearing.HearingStartDateTime ||
            firstHearing.HearingEndDateTime != secondHearing.HearingEndDateTime)
        {
            return BadRequest(ApiReturnMessages.HearingsDatesNotMatch);
        }

        if (secondHearing.HearingReservedUntil.HasValue && secondHearing.HearingReservedUntil >= DateTime.UtcNow)
        {
            return BadRequest(string.Format(ApiReturnMessages.ReservedHearingForReassign, request.SecondHearingId));
        }

        var result = await _hearingService.SwitchHearingOwners(request);

        if (result)
        {
            return Ok(ApiReturnMessages.Succeeded);
        }

        return BadRequest();
    }

    [AuthorizationRequired(new[] { RoleNames.ExtendedAdmin })]
    [HttpPost("api/hearing/reschedule")]
    public async Task<IActionResult> Reschedule([FromBody] RescheduleRequest request)
    {
        var now = DateTime.UtcNow;

        var firstHearing = await _hearingService.GetHearingAsync(request.FirstHearingId);
        var secondHearing = await _hearingService.GetHearingAsync(request.SecondHearingId);

        if (secondHearing.HearingReservedUntil.HasValue && secondHearing.HearingReservedUntil >= DateTime.UtcNow)
        {
            return BadRequest(string.Format(ApiReturnMessages.ReservedHearing, request.SecondHearingId));
        }

        var firstHearingStartDateTime = DateTime.Parse(firstHearing.HearingEndDateTime, styles: DateTimeStyles.AdjustToUniversal);
        if (firstHearingStartDateTime <= now)
        {
            return BadRequest(string.Format(ApiReturnMessages.InvalidHearingForSwitch, request.FirstHearingId));
        }

        var secondHearingStartDateTime = DateTime.Parse(secondHearing.HearingEndDateTime, styles: DateTimeStyles.AdjustToUniversal);
        if (secondHearingStartDateTime <= now)
        {
            return BadRequest(string.Format(ApiReturnMessages.InvalidHearingForSwitch, request.SecondHearingId));
        }

        var firstDisputeHearings = await _disputeHearingService.GetDisputeHearingsByHearing(request.FirstHearingId);
        var secondDisputeHearings = await _disputeHearingService.GetDisputeHearingsByHearing(request.SecondHearingId);

        if (firstDisputeHearings.Count == 0)
        {
            return BadRequest(string.Format(ApiReturnMessages.NotBookedHearing, request.FirstHearingId));
        }

        if (secondDisputeHearings.Count != 0)
        {
            return BadRequest(string.Format(ApiReturnMessages.AlreadyBookedHearing, request.SecondHearingId));
        }

        var result = await _hearingService.MoveDisputeHearings(request);

        if (result)
        {
            return Ok(ApiReturnMessages.Succeeded);
        }

        return BadRequest();
    }

    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.User })]
    [HttpPost("api/hearings/reserveavailablehearing")]
    public async Task<IActionResult> ReserveAvailableHearings(ReserveAvailableHearingsRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (request.MinHearingStartTime < DateTime.UtcNow.AddDays(FromMinDate))
        {
            return BadRequest(ApiReturnMessages.ReserveMinHearingStartTime);
        }

        if (request.MaxHearingStartTime.HasValue)
        {
            if (request.MaxHearingStartTime <= request.MinHearingStartTime)
            {
                return BadRequest(ApiReturnMessages.InvalidMinMaxHearingDate);
            }
        }

        if (request.HearingsToReserve.HasValue)
        {
            var maxHearingReservationCount = await _systemSettingsService.GetValueAsync<int>(SettingKeys.MaxHearingReservations);

            if (request.HearingsToReserve.Value > maxHearingReservationCount)
            {
                return BadRequest(string.Format(ApiReturnMessages.MaxHearingReservationsExceed, maxHearingReservationCount));
            }
        }

        var token = Request.GetToken();
        var disputeGuid = Request.GetDisputeGuid();

        var reserveAvailableHearings = await _hearingService.ReserveAvailableHearings(request, token, disputeGuid);
        if (reserveAvailableHearings != null)
        {
            return Ok(reserveAvailableHearings);
        }

        return BadRequest();
    }

    [AuthorizationRequired(new[] { RoleNames.Admin })]
    [HttpPost("api/hearings/holdhearing/{hearingId:int}")]
    public async Task<IActionResult> HoldHearing(int hearingId, HoldHearingRequest request)
    {
        if (request.HearingReservedUntil < DateTime.UtcNow)
        {
            return BadRequest(ApiReturnMessages.InvalidReservedUntilDateTime);
        }

        var hearing = await _hearingService.GetHearingWithDisputeHearings(hearingId);
        if (hearing == null)
        {
            return BadRequest(ApiReturnMessages.InvalidHearingId);
        }

        if (hearing.DisputeHearings.Count > 0)
        {
            return BadRequest(ApiReturnMessages.NotHoldAssociatedHearings);
        }

        if (hearing.HearingReservedUntil.HasValue && hearing.HearingReservedUntil > DateTime.UtcNow)
        {
            return BadRequest(ApiReturnMessages.HearingIsReservedForHold);
        }

        if (request.HearingReservedDisputeGuid.HasValue)
        {
            var disputeExists = await _disputeService.DisputeExistsAsync(request.HearingReservedDisputeGuid.Value);
            if (!disputeExists)
            {
                return BadRequest(string.Format(ApiReturnMessages.DisputeDoesNotExist, request.HearingReservedDisputeGuid.Value));
            }
        }

        var token = Request.GetToken();
        var result = await _hearingService.HoldHearing(hearingId, token, request);
        if (result)
        {
            return Ok(ApiReturnMessages.Ok);
        }

        return BadRequest();
    }

    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.User })]
    [HttpPost("api/hearings/bookreservedhearing/{hearingId:int}")]
    public async Task<IActionResult> BookReservedHearing(int hearingId)
    {
        var hearing = await _hearingService.GetHearingAsync(hearingId);
        if (hearing == null)
        {
            return BadRequest(ApiReturnMessages.InvalidHearingId);
        }

        var disputeGuid = Request.GetDisputeGuid();
        if (disputeGuid != Guid.Empty)
        {
            var disputeExists = await _disputeService.DisputeExistsAsync(disputeGuid);
            if (!disputeExists)
            {
                return BadRequest(ApiReturnMessages.DisputeGuidRequiredForBooking);
            }
        }
        else
        {
            return BadRequest(ApiReturnMessages.DisputeGuidRequired);
        }

        if (!hearing.HearingReservedUntil.HasValue || hearing.HearingReservedUntil <= DateTime.UtcNow)
        {
            return BadRequest(ApiReturnMessages.HearingNotReserved);
        }

        var token = Request.GetToken();
        var userToken = await _tokenService.GetUserToken(token);
        if (!hearing.HearingReservedById.HasValue || hearing.HearingReservedById.Value != userToken.UserTokenId)
        {
            return BadRequest(ApiReturnMessages.HearingNotReserved);
        }

        var result = await _hearingService.BookReservedHearing(hearingId, disputeGuid);
        if (result)
        {
            return Ok();
        }

        return BadRequest();
    }

    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.User })]
    [HttpPost("api/hearings/cancelreservedhearing/{hearingId:int}")]
    public async Task<IActionResult> CancelReservedHearing(int hearingId)
    {
        var hearing = await _hearingService.GetHearingAsync(hearingId);
        if (hearing == null)
        {
            return BadRequest(ApiReturnMessages.InvalidHearingId);
        }

        if (!hearing.HearingReservedUntil.HasValue || hearing.HearingReservedUntil < DateTime.UtcNow)
        {
            return BadRequest(ApiReturnMessages.HearingNotReserved);
        }

        var result = await _hearingService.CancelReservedHearing(hearingId);
        if (result)
        {
            return Ok(ApiReturnMessages.Ok);
        }

        return BadRequest();
    }

    [HttpGet("/api/hearings/onholdhearings")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.User })]
    public async Task<IActionResult> GetOnHoldHearings(OnHoldHearingsRequest request, int index, int count)
    {
        var onHoldHearings = await _hearingService.GetOnHoldHearings(request, index, count);
        if (onHoldHearings != null)
        {
            return Ok(onHoldHearings);
        }

        return NotFound();
    }

    [AuthorizationRequired(new[] { RoleNames.Admin })]
    [HttpPost("api/hearings/linkpasthearings")]
    public async Task<IActionResult> LinkPastHearings(Guid staticDisputeGuid, Guid movedDisputeGuid)
    {
        var staticDispute = await _disputeService.GetDisputeNoTrackAsync(staticDisputeGuid);
        if (staticDispute == null)
        {
            return BadRequest(string.Format(ApiReturnMessages.DisputeDoesNotExist, staticDisputeGuid));
        }

        var staticDisputeHearings = await _disputeHearingService.GetDisputeHearings(staticDisputeGuid);
        var staticHearings = staticDisputeHearings.Select(x => x.Hearing);
        var pastStaticHearing = staticHearings.Where(x => x.HearingStartDateTime < DateTime.UtcNow).OrderByDescending(x => x.HearingStartDateTime).FirstOrDefault();
        if (pastStaticHearing == null)
        {
            return BadRequest(ApiReturnMessages.NotAssociatedStaticDisputeGuidInPast);
        }

        var otherExistedHearings = await _disputeHearingService.GetDisputeHearingsByHearing(pastStaticHearing.HearingId);
        otherExistedHearings = otherExistedHearings.Where(x => x.DisputeGuid != staticDisputeGuid).ToList();
        if (otherExistedHearings != null && otherExistedHearings.Count > 0)
        {
            return BadRequest(ApiReturnMessages.StaticAlreadyLinkedToAnotherDispute);
        }

        var movedDispute = await _disputeService.GetDisputeNoTrackAsync(movedDisputeGuid);
        if (movedDispute == null)
        {
            return BadRequest(string.Format(ApiReturnMessages.DisputeDoesNotExist, movedDisputeGuid));
        }

        var movedDisputeHearings = await _disputeHearingService.GetDisputeHearings(movedDisputeGuid);
        var movedHearings = movedDisputeHearings.Select(x => x.Hearing);
        var pastMovedHearing = movedHearings.Where(x => x.HearingStartDateTime > DateTime.UtcNow).OrderByDescending(x => x.HearingStartDateTime).FirstOrDefault();
        if (pastMovedHearing == null)
        {
            return BadRequest(ApiReturnMessages.NotAssociatedStaticDisputeGuidInPast);
        }

        otherExistedHearings = await _disputeHearingService.GetDisputeHearingsByHearing(pastMovedHearing.HearingId);
        otherExistedHearings = otherExistedHearings.Where(x => x.DisputeGuid != movedDisputeGuid).ToList();
        if (otherExistedHearings != null && otherExistedHearings.Count > 0)
        {
            return BadRequest(ApiReturnMessages.MovedAlreadyLinkedToAnotherDispute);
        }

        var result = await _disputeHearingService.LinkPastHearing(staticDisputeGuid, movedDisputeGuid);
        if (result != null)
        {
            return Ok(result);
        }

        return NotFound();
    }

    private async Task<IActionResult> ValidatePostRequest(HearingRequest request, int hearingId)
    {
        switch (request.HearingType)
        {
            case (byte)HearingType.ConferenceCall:
            case (byte)HearingType.PreConferenceCall:
                if (request.ConferenceBridgeId == null)
                {
                    return BadRequest(string.Format(ApiReturnMessages.ConferenceBridgeIsNotProvided, (byte)HearingType.PreConferenceCall));
                }
                else
                {
                    var conferenceBridgeExists = await _conferenceBridgeService.ConferenceBridgeExists((int)request.ConferenceBridgeId);
                    if (!conferenceBridgeExists)
                    {
                        return BadRequest(string.Format(ApiReturnMessages.ConferenceBridgeDoesNotExist, request.ConferenceBridgeId));
                    }

                    var conferenceBridgeIsBooked = await
                        _conferenceBridgeService.ConferenceBridgeIsBooked((int)request.ConferenceBridgeId, request.HearingStartDateTime);
                    if (conferenceBridgeIsBooked)
                    {
                        return BadRequest(ApiReturnMessages.ConferenceBridgeIsBooked);
                    }
                }

                break;
            case (byte)HearingType.FaceToFace:
            case (byte)HearingType.Other:
                if (request.ConferenceBridgeId != null)
                {
                    var conferenceBridgeExists = await _conferenceBridgeService.ConferenceBridgeExists((int)request.ConferenceBridgeId);
                    if (!conferenceBridgeExists)
                    {
                        return BadRequest(string.Format(ApiReturnMessages.ConferenceBridgeDoesNotExist, request.ConferenceBridgeId));
                    }

                    var conferenceBridgeIsBooked = await
                        _conferenceBridgeService.ConferenceBridgeIsBooked((int)request.ConferenceBridgeId, request.HearingStartDateTime);
                    if (conferenceBridgeIsBooked)
                    {
                        return BadRequest(ApiReturnMessages.ConferenceBridgeIsBooked);
                    }
                }

                break;
        }

        return await ValidateRequest(request, hearingId);
    }

    private async Task<IActionResult> ValidatePatchRequest(HearingRequest request, int hearingId, Hearing hearing)
    {
        switch (request.HearingType)
        {
            case (byte)HearingType.ConferenceCall:
            case (byte)HearingType.PreConferenceCall:
                if (request.ConferenceBridgeId == null)
                {
                    return BadRequest(string.Format(ApiReturnMessages.ConferenceBridgeIsNotProvided, (byte)HearingType.PreConferenceCall));
                }
                else
                {
                    if (request.ConferenceBridgeId != hearing.ConferenceBridgeId)
                    {
                        var conferenceBridgeExists = await _conferenceBridgeService.ConferenceBridgeExists((int)request.ConferenceBridgeId);
                        if (!conferenceBridgeExists)
                        {
                            return BadRequest(string.Format(ApiReturnMessages.ConferenceBridgeDoesNotExist, request.ConferenceBridgeId));
                        }

                        var conferenceBridgeIsBooked = await
                            _conferenceBridgeService.ConferenceBridgeIsBooked((int)request.ConferenceBridgeId, request.HearingStartDateTime);
                        if (conferenceBridgeIsBooked)
                        {
                            return BadRequest(ApiReturnMessages.ConferenceBridgeIsBooked);
                        }
                    }
                }

                break;
            case (byte)HearingType.FaceToFace:
            case (byte)HearingType.Other:
                if (request.ConferenceBridgeId != null && request.ConferenceBridgeId != hearing.ConferenceBridgeId)
                {
                    var conferenceBridgeExists = await _conferenceBridgeService.ConferenceBridgeExists((int)request.ConferenceBridgeId);
                    if (!conferenceBridgeExists)
                    {
                        return BadRequest(string.Format(ApiReturnMessages.ConferenceBridgeDoesNotExist, request.ConferenceBridgeId));
                    }

                    var conferenceBridgeIsBooked = await
                        _conferenceBridgeService.ConferenceBridgeIsBooked((int)request.ConferenceBridgeId, request.HearingStartDateTime);
                    if (conferenceBridgeIsBooked)
                    {
                        return BadRequest(ApiReturnMessages.ConferenceBridgeIsBooked);
                    }
                }

                break;
        }

        return await ValidateRequest(request, hearingId);
    }

    private async Task<IActionResult> ValidateRequest(HearingRequest request, int hearingId)
    {
        if (request.HearingOwner == null)
        {
            return BadRequest(ApiReturnMessages.HearingOwnerIsRequired);
        }

        var userIsValid = await _hearingService.HearingOwnerIsValid((int)request.HearingOwner);
        if (!userIsValid)
        {
            return BadRequest(ApiReturnMessages.HearingTypeAssignIsNotValid);
        }

        var ownerIsBlocked = await _hearingService.HearingOwnerIsBlocked((int)request.HearingOwner, request.HearingStartDateTime, request.HearingEndDateTime, hearingId);
        if (ownerIsBlocked)
        {
            return BadRequest(ApiReturnMessages.HearingOwnerIsBlocked);
        }

        if (request.StaffParticipant1 != null)
        {
            var staffParticipant1Exists = await _userService.UserExists((int)request.StaffParticipant1);
            if (!staffParticipant1Exists)
            {
                return BadRequest(string.Format(ApiReturnMessages.StaffParticipantIsNotValid, 1));
            }

            var staffParticipantIsBlocked = await _hearingService.HearingOwnerIsBlocked((int)request.StaffParticipant1, request.HearingStartDateTime, request.HearingEndDateTime, hearingId);
            if (staffParticipantIsBlocked)
            {
                return BadRequest(string.Format(ApiReturnMessages.StaffParticipantIsBlocked, 1));
            }
        }

        if (request.StaffParticipant2 != null)
        {
            var staffParticipant2Exists = await _userService.UserExists((int)request.StaffParticipant2);
            if (!staffParticipant2Exists)
            {
                return BadRequest(string.Format(ApiReturnMessages.StaffParticipantIsNotValid, 2));
            }

            var staffParticipantIsBlocked = await _hearingService.HearingOwnerIsBlocked((int)request.StaffParticipant2, request.HearingStartDateTime, request.HearingEndDateTime, hearingId);
            if (staffParticipantIsBlocked)
            {
                return BadRequest(string.Format(ApiReturnMessages.StaffParticipantIsBlocked, 2));
            }
        }

        if (request.StaffParticipant3 != null)
        {
            var staffParticipant3Exists = await _userService.UserExists((int)request.StaffParticipant3);
            if (!staffParticipant3Exists)
            {
                return BadRequest(string.Format(ApiReturnMessages.StaffParticipantIsNotValid, 3));
            }

            var staffParticipantIsBlocked = await _hearingService.HearingOwnerIsBlocked((int)request.StaffParticipant3, request.HearingStartDateTime, request.HearingEndDateTime, hearingId);
            if (staffParticipantIsBlocked)
            {
                return BadRequest(string.Format(ApiReturnMessages.StaffParticipantIsBlocked, 3));
            }
        }

        if (request.StaffParticipant4 != null)
        {
            var staffParticipant4Exists = await _userService.UserExists((int)request.StaffParticipant4);
            if (!staffParticipant4Exists)
            {
                return BadRequest(string.Format(ApiReturnMessages.StaffParticipantIsNotValid, 4));
            }

            var staffParticipantIsBlocked = await _hearingService.HearingOwnerIsBlocked((int)request.StaffParticipant4, request.HearingStartDateTime, request.HearingEndDateTime, hearingId);
            if (staffParticipantIsBlocked)
            {
                return BadRequest(string.Format(ApiReturnMessages.StaffParticipantIsBlocked, 4));
            }
        }

        if (request.StaffParticipant5 != null)
        {
            var staffParticipant5Exists = await _userService.UserExists((int)request.StaffParticipant5);
            if (!staffParticipant5Exists)
            {
                return BadRequest(string.Format(ApiReturnMessages.StaffParticipantIsNotValid, 5));
            }

            var staffParticipantIsBlocked = await _hearingService.HearingOwnerIsBlocked((int)request.StaffParticipant5, request.HearingStartDateTime, request.HearingEndDateTime, hearingId);
            if (staffParticipantIsBlocked)
            {
                return BadRequest(string.Format(ApiReturnMessages.StaffParticipantIsBlocked, 5));
            }
        }

        return new OkResult();
    }
}