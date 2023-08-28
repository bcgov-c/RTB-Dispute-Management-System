using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.DisputeFlag;
using CM.Business.Services.DisputeFlag;
using CM.Business.Services.DisputeServices;
using CM.Business.Services.Parties;
using CM.Business.Services.UserServices;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
public class DisputeFlagController : BaseController
{
    private readonly IDisputeFlagService _disputeFlagService;
    private readonly IDisputeService _disputeService;
    private readonly IMapper _mapper;
    private readonly IParticipantService _participantService;
    private readonly IUserService _userService;

    public DisputeFlagController(IMapper mapper, IDisputeFlagService disputeFlagService, IDisputeService disputeService, IParticipantService participantService, IUserService userService)
    {
        _disputeFlagService = disputeFlagService;
        _disputeService = disputeService;
        _participantService = participantService;
        _userService = userService;
        _mapper = mapper;
    }

    [HttpPost("api/disputeflag/{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser, RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> Post(Guid disputeGuid, [FromBody] PostDisputeFlagRequest request)
    {
        TryValidateModel(request);

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var disputeExists = await _disputeService.DisputeExistsAsync(disputeGuid);
        if (!disputeExists)
        {
            return BadRequest(string.Format(ApiReturnMessages.DisputeDoesNotExist, disputeGuid));
        }

        if (request.FlagOwnerId.HasValue)
        {
            var isActiveAdmin = await _userService.UserIsActiveAdmin(request.FlagOwnerId.Value);
            if (!isActiveAdmin)
            {
                return BadRequest(ApiReturnMessages.InvalidFlagOwnerId);
            }
        }

        if (request.FlagParticipantId.HasValue)
        {
            var participant = await _participantService.GetByIdAsync(request.FlagParticipantId.Value);
            if (participant == null || participant.DisputeGuid != disputeGuid)
            {
                return BadRequest(ApiReturnMessages.InvalidFlagParticipant);
            }
        }

        DisputeSetContext(disputeGuid);
        var newDisputeFlag = await _disputeFlagService.CreateAsync(disputeGuid, request);
        EntityIdSetContext(newDisputeFlag.DisputeFlagId);
        return Ok(newDisputeFlag);
    }

    [ApplyConcurrencyCheck]
    [HttpPatch("api/disputeflag/{disputeFlagId:int}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> Patch(int disputeFlagId, [FromBody] JsonPatchDocumentExtension<PatchDisputeFlagRequest> request)
    {
        if (CheckModified(_disputeFlagService, disputeFlagId))
        {
            return StatusConflicted();
        }

        var originalDisputeFlag = await _disputeFlagService.GetById(disputeFlagId);
        if (originalDisputeFlag != null)
        {
            var disputeFlagToPatch = _mapper.Map<Data.Model.DisputeFlag, PatchDisputeFlagRequest>(originalDisputeFlag);
            request.ApplyTo(disputeFlagToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var ownerId = request.GetValue<int?>("/flag_owner_id");
            if (ownerId.Exists && !await _userService.UserIsActiveAdmin(ownerId.Value.GetValueOrDefault()))
            {
                return BadRequest(ApiReturnMessages.InvalidFlagOwnerId);
            }

            var participantId = request.GetValue<int?>("/flag_participant_id");
            if (participantId.Exists)
            {
                var participant = await _participantService.GetByIdAsync(participantId.Value.GetValueOrDefault());
                if (participant == null || participant.DisputeGuid != disputeFlagToPatch.DisputeGuid)
                {
                    return BadRequest(ApiReturnMessages.InvalidFlagParticipant);
                }
            }

            await DisputeResolveAndSetContext(_disputeFlagService, disputeFlagId);
            var result = await _disputeFlagService.PatchAsync(disputeFlagId, disputeFlagToPatch);

            if (result != null)
            {
                EntityIdSetContext(disputeFlagId);
                return Ok(result);
            }
        }

        return NotFound();
    }

    [HttpDelete("/api/disputeflag/{disputeFlagId:int}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Delete(int disputeFlagId)
    {
        await DisputeResolveAndSetContext(_disputeFlagService, disputeFlagId);
        if (CheckModified(_disputeFlagService, disputeFlagId))
        {
            return StatusConflicted();
        }

        await DisputeResolveAndSetContext(_disputeFlagService, disputeFlagId);
        var result = await _disputeFlagService.DeleteAsync(disputeFlagId);
        if (result)
        {
            EntityIdSetContext(disputeFlagId);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }

    [HttpGet("/api/disputeflag/{disputeFlagId:int}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> Get(int disputeFlagId)
    {
        var disputeFlag = await _disputeFlagService.GetAsync(disputeFlagId);
        if (disputeFlag != null)
        {
            return Ok(disputeFlag);
        }

        return NotFound();
    }

    [HttpGet("/api/disputeflags/{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> GetByDisputeGuid(Guid disputeGuid)
    {
        var disputeFlagList = await _disputeFlagService.GetList(disputeGuid);
        return Ok(disputeFlagList);
    }

    [HttpGet("/api/linkeddisputeflags/{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser, RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> GetLinkedDisputeFlags(Guid disputeGuid)
    {
        var linkedDisputeFlags = await _disputeFlagService.GetLinkedFlags(disputeGuid);
        return Ok(linkedDisputeFlags);
    }
}