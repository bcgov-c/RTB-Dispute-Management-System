using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.TrialParticipant;
using CM.Business.Services.DisputeServices;
using CM.Business.Services.Parties;
using CM.Business.Services.Trial;
using CM.Business.Services.TrialParticipant;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
public class TrialParticipantController : BaseController
{
    private readonly IDisputeService _disputeService;
    private readonly IMapper _mapper;
    private readonly IParticipantService _participantService;
    private readonly ITrialParticipantService _trialParticipantService;
    private readonly ITrialService _trialService;

    public TrialParticipantController(IMapper mapper, IDisputeService disputeService, ITrialParticipantService trialParticipantService, ITrialService trialService, IParticipantService participantService)
    {
        _trialParticipantService = trialParticipantService;
        _trialService = trialService;
        _participantService = participantService;
        _disputeService = disputeService;
        _mapper = mapper;
    }

    [HttpPost("api/trialparticipant/{trialGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser, RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> Post(Guid trialGuid, [FromBody] PostTrialParticipantRequest request)
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

        if (request.DisputeGuid.HasValue)
        {
            var trialDispute = await _disputeService.GetDisputeNoTrackAsync(request.DisputeGuid.Value);
            if (trialDispute == null)
            {
                return BadRequest(string.Format(ApiReturnMessages.DisputeDoesNotExist, request.DisputeGuid.Value));
            }
        }

        if (request.ParticipantId.HasValue)
        {
            if (!request.DisputeGuid.HasValue)
            {
                return BadRequest(ApiReturnMessages.DisputeGuidRequired);
            }

            var participant = await _participantService.GetAsync(request.ParticipantId.Value);
            if (participant == null || participant.DisputeGuid != request.DisputeGuid)
            {
                return BadRequest(ApiReturnMessages.InvalidOptedInParticipant);
            }
        }

        var newTrialDispute = await _trialParticipantService.CreateAsync(trialGuid, request);
        EntityGuidSetContext(newTrialDispute.TrialGuid);
        return Ok(newTrialDispute);
    }

    [ApplyConcurrencyCheck]
    [HttpPatch("api/trialparticipant/{trialParticipantGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser, RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> Patch(Guid trialParticipantGuid, [FromBody] JsonPatchDocumentExtension<PatchTrialParticipantRequest> request)
    {
        if (CheckModified(_trialParticipantService, trialParticipantGuid))
        {
            return StatusConflicted();
        }

        var originalTrialParticipant = await _trialParticipantService.GetTrialParticipant(trialParticipantGuid);
        if (originalTrialParticipant != null)
        {
            var trialParticipantToPatch = _mapper.Map<Data.Model.TrialParticipant, PatchTrialParticipantRequest>(originalTrialParticipant);
            request.ApplyTo(trialParticipantToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var participantType = request.GetValue<byte?>("/participant_type");
            if (participantType.Exists)
            {
                if (!participantType.Value.HasValue)
                {
                    return BadRequest(ApiReturnMessages.ParticipantTrialTypeRequired);
                }
            }

            var participantRole = request.GetValue<byte?>("/participant_role");
            if (participantRole.Exists)
            {
                if (!participantRole.Value.HasValue)
                {
                    return BadRequest(ApiReturnMessages.ParticipantTrialRoleRequired);
                }
            }

            var participantTrialStatus = request.GetValue<byte?>("/participant_status");
            if (participantTrialStatus.Exists)
            {
                if (!participantTrialStatus.Value.HasValue)
                {
                    return BadRequest(ApiReturnMessages.ParticipantTrialStatusRequired);
                }
            }

            var result = await _trialParticipantService.PatchAsync(trialParticipantGuid, trialParticipantToPatch);

            if (result != null)
            {
                EntityGuidSetContext(trialParticipantGuid);
                return Ok(result);
            }
        }

        return NotFound();
    }

    [HttpDelete("/api/trialparticipant/{trialParticipantGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.User, RoleNames.AccessCode, RoleNames.OfficePay })]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Delete(Guid trialParticipantGuid)
    {
        if (CheckModified(_trialParticipantService, trialParticipantGuid))
        {
            return StatusConflicted();
        }

        var associatedRecordExists = await _trialParticipantService.IsAssociatedRecordsExists(trialParticipantGuid);
        if (associatedRecordExists)
        {
            return BadRequest(ApiReturnMessages.AssociatedRecordExistsForTrialParticipant);
        }

        var result = await _trialParticipantService.DeleteAsync(trialParticipantGuid);
        if (result)
        {
            EntityGuidSetContext(trialParticipantGuid);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }
}