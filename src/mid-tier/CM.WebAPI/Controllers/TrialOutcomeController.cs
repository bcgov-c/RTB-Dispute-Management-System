using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.TrialOutcome;
using CM.Business.Services.Trial;
using CM.Business.Services.TrialDispute;
using CM.Business.Services.TrialIntervention;
using CM.Business.Services.TrialOutcome;
using CM.Business.Services.TrialParticipant;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using CM.WebAPI.WebApiHelpers;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
public class TrialOutcomeController : BaseController
{
    private readonly IMapper _mapper;
    private readonly ITrialDisputeService _trialDisputeService;
    private readonly ITrialInterventionService _trialInterventionService;
    private readonly ITrialOutcomeService _trialOutcomeService;
    private readonly ITrialParticipantService _trialParticipantService;
    private readonly ITrialService _trialService;

    public TrialOutcomeController(IMapper mapper, ITrialOutcomeService trialOutcomeService, ITrialInterventionService trialInterventionService, ITrialParticipantService trialParticipantService, ITrialDisputeService trialDisputeService, ITrialService trialService)
    {
        _trialOutcomeService = trialOutcomeService;
        _trialInterventionService = trialInterventionService;
        _trialParticipantService = trialParticipantService;
        _trialDisputeService = trialDisputeService;
        _trialService = trialService;
        _mapper = mapper;
    }

    [HttpPost("api/trialoutcome/{trialGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.User, RoleNames.AccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> Post(Guid trialGuid, [FromBody] PostTrialOutcomeRequest request)
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

        if (request.TrialDisputeGuid.HasValue)
        {
            var trialDispute = await _trialDisputeService.GetTrialDispute(request.TrialDisputeGuid.Value);
            if (trialDispute == null || trialDispute.TrialGuid != trialGuid)
            {
                return BadRequest(string.Format(ApiReturnMessages.DisputeDoesNotExist, request.TrialDisputeGuid.Value));
            }
        }

        if (request.TrialParticipantGuid.HasValue)
        {
            var trialParticipant = await _trialParticipantService.GetTrialParticipant(request.TrialParticipantGuid.Value);
            if (trialParticipant == null || trialParticipant.TrialGuid != trialGuid)
            {
                return BadRequest(ApiReturnMessages.InvalidTrialParticipant);
            }
        }

        if (request.TrialInterventionGuid.HasValue)
        {
            var trialIntervention = await _trialInterventionService.GetTrialIntervention(request.TrialInterventionGuid.Value);
            if (trialIntervention == null || trialIntervention.TrialGuid != trialGuid)
            {
                return BadRequest(ApiReturnMessages.InvalidTrialIntervention);
            }
        }

        var newTrialOutcome = await _trialOutcomeService.CreateAsync(trialGuid, request);
        EntityGuidSetContext(newTrialOutcome.TrialGuid);
        return Ok(newTrialOutcome);
    }

    [ApplyConcurrencyCheck]
    [HttpPatch("api/trialoutcome/{trialOutcomeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.User, RoleNames.AccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> Patch(Guid trialOutcomeGuid, [FromBody] JsonPatchDocumentExtension<PatchTrialOutcomeRequest> request)
    {
        if (CheckModified(_trialOutcomeService, trialOutcomeGuid))
        {
            return StatusConflicted();
        }

        var originalTrialOutcome = await _trialOutcomeService.GetTrialOutcome(trialOutcomeGuid);
        if (originalTrialOutcome != null)
        {
            var trialOutcomeToPatch = _mapper.Map<Data.Model.TrialOutcome, PatchTrialOutcomeRequest>(originalTrialOutcome);
            request.ApplyTo(trialOutcomeToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var outcomeStatus = request.GetValue<byte?>("/outcome_status");
            if (outcomeStatus.Exists)
            {
                if (!outcomeStatus.Value.HasValue)
                {
                    return BadRequest(ApiReturnMessages.InvalidOutcomeStatus);
                }
            }

            var participantRole = request.GetValue<byte?>("/outcome_by");
            if (participantRole.Exists)
            {
                if (!participantRole.Value.HasValue)
                {
                    return BadRequest(ApiReturnMessages.InvalidOutcomeBy);
                }
            }

            var result = await _trialOutcomeService.PatchAsync(trialOutcomeGuid, trialOutcomeToPatch);

            if (result != null)
            {
                EntityGuidSetContext(trialOutcomeGuid);
                return Ok(result);
            }
        }

        return NotFound();
    }

    [HttpDelete("/api/trialoutcome/{trialOutcomeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.User, RoleNames.AccessCode, RoleNames.OfficePay })]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Delete(Guid trialOutcomeGuid)
    {
        if (CheckModified(_trialOutcomeService, trialOutcomeGuid))
        {
            return StatusConflicted();
        }

        var result = await _trialOutcomeService.DeleteAsync(trialOutcomeGuid);
        if (result)
        {
            EntityGuidSetContext(trialOutcomeGuid);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }
}