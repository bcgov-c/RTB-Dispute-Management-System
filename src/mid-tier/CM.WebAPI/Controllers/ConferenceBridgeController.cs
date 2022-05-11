using System;
using System.Threading.Tasks;
using CM.Business.Entities.Models.ConferenceBridge;
using CM.Business.Services.ConferenceBridge;
using CM.Business.Services.InternalUserRole;
using CM.Business.Services.UserServices;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using CM.WebAPI.WebApiHelpers;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[AuthorizationRequired(new[] { RoleNames.Admin })]
public class ConferenceBridgeController : BaseController
{
    private readonly IConferenceBridgeService _conferenceBridgeService;
    private readonly IInternalUserRoleService _internalUserRoleService;
    private readonly IUserService _userService;

    public ConferenceBridgeController(IConferenceBridgeService conferenceBridgeService, IUserService userService, IInternalUserRoleService internalUserRoleService)
    {
        _conferenceBridgeService = conferenceBridgeService;
        _userService = userService;
        _internalUserRoleService = internalUserRoleService;
    }

    [HttpPost("api/conferencebridge")]
    public async Task<IActionResult> Post([FromBody]ConferenceBridgeRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (request.ModeratorCode != null)
        {
            var moderatorCodeExists = await _conferenceBridgeService.ModeratorCodeExists(request.ModeratorCode);
            if (moderatorCodeExists)
            {
                return BadRequest(ApiReturnMessages.ModeratorCodeExists);
            }
        }

        if (request.ParticipantCode != null)
        {
            var participantCodeExists = await _conferenceBridgeService.ParticipantCodeExists(request.ParticipantCode);
            if (participantCodeExists)
            {
                return BadRequest(ApiReturnMessages.ParticipantCodeExists);
            }
        }

        if (request.PreferredOwner != null)
        {
            var validUser = await _userService.UserIsAdmin((int)request.PreferredOwner);
            if (!validUser)
            {
                return BadRequest(ApiReturnMessages.PreferredOwnerIsNotValid);
            }

            var ownerIsArbitrator = await _internalUserRoleService.InternalUserIsValid((int)request.PreferredOwner);
            if (!ownerIsArbitrator)
            {
                return BadRequest(ApiReturnMessages.PreferredOwnerIsNotArbitrator);
            }

            var timeIsOverlap = await _conferenceBridgeService.TimeIsOverlap((int)request.PreferredOwner, request.PreferredStartTime, request.PreferredEndTime);
            if (timeIsOverlap)
            {
                return BadRequest(ApiReturnMessages.TimeOverlap);
            }
        }

        var result = await _conferenceBridgeService.CreateAsync(request);
        EntityIdSetContext(result.ConferenceBridgeId);
        return Ok(result);
    }

    [HttpPatch("api/conferencebridge/{bridgeId:int}")]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Patch(int bridgeId, [FromBody]JsonPatchDocumentExtension<ConferenceBridgeRequest> conferenceBridge)
    {
        if (CheckModified(_conferenceBridgeService, bridgeId))
        {
            return StatusConflicted();
        }

        var conferenceBridgeToPatch = await _conferenceBridgeService.GetForPatchAsync(bridgeId);
        if (conferenceBridgeToPatch != null)
        {
            conferenceBridge.ApplyTo(conferenceBridgeToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var moderatorCode = conferenceBridge.GetValue<string>("/moderator_code");
            if (moderatorCode.Exists && await _conferenceBridgeService.ModeratorCodeExists(moderatorCode.Value))
            {
                return BadRequest(string.Format(ApiReturnMessages.ModeratorCodeExists));
            }

            var participantCode = conferenceBridge.GetValue<string>("/participant_code");
            if (participantCode.Exists && await _conferenceBridgeService.ParticipantCodeExists(participantCode.Value))
            {
                return BadRequest(string.Format(ApiReturnMessages.ParticipantCodeExists));
            }

            var preferredOwner = conferenceBridge.GetValue<int>("/preferred_owner");
            if (preferredOwner.Exists)
            {
                if (!await _userService.UserIsAdmin(preferredOwner.Value))
                {
                    return BadRequest(string.Format(ApiReturnMessages.PreferredOwnerIsNotValid));
                }

                var ownerIsArbitrator = await _internalUserRoleService.InternalUserIsValid(preferredOwner.Value);
                if (!ownerIsArbitrator)
                {
                    return BadRequest(ApiReturnMessages.PreferredOwnerIsNotArbitrator);
                }

                var startTime = conferenceBridge.GetValue<DateTime>("/preferred_start_time");
                var endTime = conferenceBridge.GetValue<DateTime>("/preferred_end_time");
                if (startTime.Exists && endTime.Exists)
                {
                    var timeIsOverlap = await _conferenceBridgeService.TimeIsOverlap(preferredOwner.Value, startTime.Value, endTime.Value);
                    if (timeIsOverlap)
                    {
                        return BadRequest(ApiReturnMessages.TimeOverlap);
                    }
                }
            }

            var result = await _conferenceBridgeService.PatchAsync(bridgeId, conferenceBridgeToPatch);

            if (result != null)
            {
                EntityIdSetContext(bridgeId);
                return Ok(result);
            }
        }

        return NotFound();
    }

    [HttpGet("api/conferencebridge/{bridgeId:int}")]
    public async Task<IActionResult> Get(int bridgeId)
    {
        var conferenceBridge = await _conferenceBridgeService.GetByIdAsync(bridgeId);
        if (conferenceBridge != null)
        {
            return Ok(conferenceBridge);
        }

        return NotFound();
    }

    [HttpGet("api/conferencebridges")]
    public async Task<IActionResult> GetAll()
    {
        var conferenceBridges = await _conferenceBridgeService.GetAllBridges();

        return Ok(conferenceBridges);
    }
}