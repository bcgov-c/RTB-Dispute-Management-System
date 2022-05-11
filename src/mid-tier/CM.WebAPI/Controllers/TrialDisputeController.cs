using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.TrialDispute;
using CM.Business.Services.DisputeServices;
using CM.Business.Services.Parties;
using CM.Business.Services.Trial;
using CM.Business.Services.TrialDispute;
using CM.Business.Services.UserServices;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using CM.WebAPI.WebApiHelpers;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
public class TrialDisputeController : BaseController
{
    private readonly IDisputeService _disputeService;
    private readonly IMapper _mapper;
    private readonly IParticipantService _participantService;
    private readonly ITrialDisputeService _trialDisputeService;
    private readonly ITrialService _trialService;
    private readonly IUserService _userService;

    public TrialDisputeController(IMapper mapper, ITrialDisputeService trialDisputeService, ITrialService trialService, IDisputeService disputeService, IParticipantService participantService, IUserService userService)
    {
        _trialDisputeService = trialDisputeService;
        _trialService = trialService;
        _disputeService = disputeService;
        _participantService = participantService;
        _userService = userService;
        _mapper = mapper;
    }

    [HttpPost("api/trialdispute/{trialGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser, RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> Post(Guid trialGuid, [FromBody] PostTrialDisputeRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var trial = await _trialService.GetTrial(trialGuid);
        if (trial == null)
        {
            return BadRequest(ApiReturnMessages.TrialInvalid);
        }

        var dispute = await _disputeService.GetDisputeNoTrackAsync(request.DisputeGuid);
        if (dispute == null)
        {
            return BadRequest(string.Format(ApiReturnMessages.DisputeDoesNotExist, request.DisputeGuid));
        }

        if (request.DisputeOptedInByParticipantId.HasValue)
        {
            var participant = await _participantService.GetAsync(request.DisputeOptedInByParticipantId.Value);
            if (participant == null || participant.DisputeGuid != request.DisputeGuid)
            {
                return BadRequest(ApiReturnMessages.InvalidOptedInParticipant);
            }
        }

        if (request.DisputeOptedInByStaffId.HasValue)
        {
            var isActiveUser = await _userService.UserIsActiveAdmin(request.DisputeOptedInByStaffId.Value);
            if (!isActiveUser)
            {
                return BadRequest(ApiReturnMessages.InvalidOptedInStaff);
            }
        }

        var newTrialDispute = await _trialDisputeService.CreateAsync(trialGuid, request);
        EntityGuidSetContext(newTrialDispute.TrialGuid);
        return Ok(newTrialDispute);
    }

    [ApplyConcurrencyCheck]
    [HttpPatch("api/trialdispute/{trialDisputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser, RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> Patch(Guid trialDisputeGuid, [FromBody] JsonPatchDocumentExtension<PatchTrialDisputeRequest> request)
    {
        if (CheckModified(_trialDisputeService, trialDisputeGuid))
        {
            return StatusConflicted();
        }

        var originalTrialDispute = await _trialDisputeService.GetTrialDispute(trialDisputeGuid);
        if (originalTrialDispute != null)
        {
            var trialDisputeToPatch = _mapper.Map<Data.Model.TrialDispute, PatchTrialDisputeRequest>(originalTrialDispute);
            request.ApplyTo(trialDisputeToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var disputeTrialRole = request.GetValue<byte?>("/dispute_role");
            if (disputeTrialRole.Exists)
            {
                if (!disputeTrialRole.Value.HasValue)
                {
                    return BadRequest(ApiReturnMessages.DisputeTrialRoleRequired);
                }
            }

            var disputeTrialStatus = request.GetValue<byte?>("/dispute_trial_status");
            if (disputeTrialStatus.Exists)
            {
                if (!disputeTrialStatus.Value.HasValue)
                {
                    return BadRequest(ApiReturnMessages.DisputeTrialStatusRequired);
                }
            }

            var result = await _trialDisputeService.PatchAsync(trialDisputeGuid, trialDisputeToPatch);

            if (result != null)
            {
                EntityGuidSetContext(trialDisputeGuid);
                return Ok(result);
            }
        }

        return NotFound();
    }

    [HttpDelete("/api/trialdispute/{trialDisputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.User, RoleNames.AccessCode, RoleNames.OfficePay })]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Delete(Guid trialDisputeGuid)
    {
        if (CheckModified(_trialDisputeService, trialDisputeGuid))
        {
            return StatusConflicted();
        }

        var associatedRecordExists = await _trialDisputeService.IsAssociatedRecordsExists(trialDisputeGuid);
        if (associatedRecordExists)
        {
            return BadRequest(ApiReturnMessages.AssociatedRecordExistsForTrialDispute);
        }

        var result = await _trialDisputeService.DeleteAsync(trialDisputeGuid);
        if (result)
        {
            EntityGuidSetContext(trialDisputeGuid);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }
}