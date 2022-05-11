using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.DisputeHearing;
using CM.Business.Services.ConferenceBridge;
using CM.Business.Services.DisputeHearing;
using CM.Business.Services.DisputeServices;
using CM.Business.Services.Hearings;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.WebAPI.Filters;
using CM.WebAPI.WebApiHelpers;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/disputehearing")]
public class DisputeHearingController : BaseController
{
    private readonly IConferenceBridgeService _conferenceBridgeService;
    private readonly IDisputeHearingService _disputeHearingService;
    private readonly IDisputeService _disputeService;
    private readonly IHearingService _hearingService;
    private readonly IMapper _mapper;

    public DisputeHearingController(IDisputeHearingService disputeHearingService, IDisputeService disputeService, IHearingService hearingService, IConferenceBridgeService conferenceBridgeService, IMapper mapper)
    {
        _disputeHearingService = disputeHearingService;
        _disputeService = disputeService;
        _hearingService = hearingService;
        _conferenceBridgeService = conferenceBridgeService;
        _mapper = mapper;
    }

    [HttpPost]
    [AuthorizationRequired(new[] { RoleNames.ExtendedAdmin })]
    public async Task<IActionResult> Post([FromBody]DisputeHearingRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (!request.DisputeGuid.HasValue && string.IsNullOrEmpty(request.ExternalFileId))
        {
            return BadRequest(ApiReturnMessages.DisputeGuidOrExternalFileIdRequired);
        }

        var hearing = await _hearingService.GetHearingAsync(request.HearingId);
        if (hearing == null)
        {
            return BadRequest(ApiReturnMessages.HearingDoesNotExist);
        }

        if (hearing.HearingReservedUntil.HasValue && hearing.HearingReservedUntil > DateTime.UtcNow)
        {
            return BadRequest(ApiReturnMessages.HearingIsReserved);
        }

        if (request.DisputeGuid.HasValue)
        {
            var disputeExists = await _disputeService.DisputeExistsAsync(request.DisputeGuid.Value);
            if (!disputeExists)
            {
                return BadRequest(ApiReturnMessages.DisputeDoesNotExist);
            }

            var isFutureHearingExist = await _disputeHearingService.IsFutureHearingExist(request.DisputeGuid.Value);
            if (isFutureHearingExist)
            {
                return BadRequest(ApiReturnMessages.FutureHearingExist);
            }

            var isOverlappedHearingExist = await _disputeHearingService.IsOverlappedHearingExist(request.DisputeGuid.Value, request.HearingId);
            if (isOverlappedHearingExist)
            {
                return BadRequest(ApiReturnMessages.OverlappedHearingExist);
            }
        }

        var primaryHearing = await _disputeHearingService.GetPrimaryHearing(request.HearingId);

        if (request.DisputeHearingRole == (byte)DisputeHearingRole.Active)
        {
            if (primaryHearing != null)
            {
                return BadRequest(ApiReturnMessages.PrimaryIsAssociated);
            }
        }

        if (request.DisputeHearingRole != (byte)DisputeHearingRole.Active)
        {
            if (primaryHearing == null)
            {
                return BadRequest(ApiReturnMessages.AtLeastOneActiveHearing);
            }
        }

        if (request.NoticeConferenceBridgeId.HasValue)
        {
            var conferenceBridge = await _conferenceBridgeService.GetByIdAsync(request.NoticeConferenceBridgeId.Value);
            if (conferenceBridge is not { BridgeStatus: (int)BridgeStatus.Active })
            {
                return BadRequest(ApiReturnMessages.ConferenceBridgeDoesNotExistOrInactive);
            }
        }

        DisputeSetContext(request.DisputeGuid.GetValueOrDefault());
        var result = await _disputeHearingService.CreateAsync(request);
        EntityIdSetContext(result.DisputeHearingId);
        return Ok(result);
    }

    [ApplyConcurrencyCheck]
    [HttpPatch("{disputeHearingId:int}")]
    [AuthorizationRequired(new[] { RoleNames.ExtendedAdmin })]
    public async Task<IActionResult> Patch(int disputeHearingId, [FromBody]JsonPatchDocumentExtension<DisputeHearingPatchRequest> disputeHearing)
    {
        if (CheckModified(_disputeHearingService, disputeHearingId))
        {
            return StatusConflicted();
        }

        var originalDisputeHearing = await _disputeHearingService.GetNoTrackingAsync(disputeHearingId);
        if (originalDisputeHearing != null)
        {
            var disputeHearingToPatch = _mapper.Map<DisputeHearing, DisputeHearingPatchRequest>(originalDisputeHearing);
            disputeHearing.ApplyTo(disputeHearingToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _mapper.Map(disputeHearingToPatch, originalDisputeHearing);
            var result = await _disputeHearingService.PatchAsync(originalDisputeHearing);

            if (result != null)
            {
                EntityIdSetContext(disputeHearingId);
                return Ok(result);
            }
        }

        return NotFound();
    }

    [ApplyConcurrencyCheck]
    [HttpDelete("{disputeHearingId:int}")]
    [AuthorizationRequired(new[] { RoleNames.ExtendedAdmin })]
    public async Task<IActionResult> Delete(int disputeHearingId)
    {
        if (CheckModified(_disputeHearingService, disputeHearingId))
        {
            return StatusConflicted();
        }

        var result = await _disputeHearingService.DeleteAsync(disputeHearingId);
        if (result)
        {
            EntityIdSetContext(disputeHearingId);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }

    [HttpGet("/api/disputehearings/{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> GetAll(Guid disputeGuid)
    {
        var disputeHearings = await _hearingService.GetDisputeHearingsAsync(disputeGuid);
        if (disputeHearings != null)
        {
            return Ok(disputeHearings);
        }

        return NotFound();
    }

    [AuthorizationRequired(new[] { RoleNames.ExtendedAdmin })]
    [HttpGet("/api/disputehearinghistory/")]
    public async Task<IActionResult> GetDisputeHearingHistory(byte searchType, Guid? disputeGuid, int? hearingId, int index, int count)
    {
        switch (searchType)
        {
            case (int)DisputeHearingHistorySearchType.DisputeGuid when string.IsNullOrEmpty(disputeGuid.ToString()):
                return BadRequest(ApiReturnMessages.DisputeHearingHistoryDisputeGuidRequired);
            case (int)DisputeHearingHistorySearchType.HearingId when !hearingId.HasValue:
                return BadRequest(ApiReturnMessages.DisputeHearingHistoryHearingIdRequired);
        }

        if (disputeGuid.HasValue)
        {
            var disputeGuidExist = await _disputeService.DisputeExistsAsync(disputeGuid.Value);
            if (!disputeGuidExist)
            {
                return BadRequest(ApiReturnMessages.DisputeDoesNotExist);
            }
        }
        else if (hearingId.HasValue)
        {
            var hearing = await _hearingService.GetHearingAsync(hearingId.Value);
            if (hearing == null)
            {
                return BadRequest(ApiReturnMessages.HearingDoesNotExist);
            }
        }

        var disputeHearingHistory = await _disputeHearingService.GetDisputeHearingHistory(searchType, disputeGuid, hearingId, index, count);
        if (disputeHearingHistory != null)
        {
            return Ok(disputeHearingHistory);
        }

        return NotFound();
    }
}