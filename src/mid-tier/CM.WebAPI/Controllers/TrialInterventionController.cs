using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.TrialIntervention;
using CM.Business.Services.Trial;
using CM.Business.Services.TrialDispute;
using CM.Business.Services.TrialIntervention;
using CM.Business.Services.TrialParticipant;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
public class TrialInterventionController : BaseController
{
    private readonly IMapper _mapper;
    private readonly ITrialDisputeService _trialDisputeService;
    private readonly ITrialInterventionService _trialInterventionService;
    private readonly ITrialParticipantService _trialParticipantService;
    private readonly ITrialService _trialService;

    public TrialInterventionController(IMapper mapper, ITrialInterventionService trialInterventionService, ITrialParticipantService trialParticipantService, ITrialDisputeService trialDisputeService, ITrialService trialService)
    {
        _trialInterventionService = trialInterventionService;
        _trialParticipantService = trialParticipantService;
        _trialDisputeService = trialDisputeService;
        _trialService = trialService;
        _mapper = mapper;
    }

    [HttpPost("api/trialintervention/{trialGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.User, RoleNames.AccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> Post(Guid trialGuid, [FromBody] PostTrialInterventionRequest request)
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
            if (trialDispute == null)
            {
                return BadRequest(string.Format(ApiReturnMessages.DisputeDoesNotExist, request.TrialDisputeGuid.Value));
            }
        }

        if (request.TrialParticipantGuid.HasValue)
        {
            var trialParticipant = await _trialParticipantService.GetTrialParticipant(request.TrialParticipantGuid.Value);
            if (trialParticipant == null || trialParticipant.TrialGuid != trialGuid)
            {
                return BadRequest(ApiReturnMessages.InvalidParticipantOnDispute);
            }
        }

        var newTrialIIntervention = await _trialInterventionService.CreateAsync(trialGuid, request);
        EntityGuidSetContext(newTrialIIntervention.TrialGuid);
        return Ok(newTrialIIntervention);
    }

    [ApplyConcurrencyCheck]
    [HttpPatch("api/trialintervention/{trialInterventionGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.User, RoleNames.AccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> Patch(Guid trialInterventionGuid, [FromBody] JsonPatchDocumentExtension<PatchTrialInterventionRequest> request)
    {
        if (CheckModified(_trialInterventionService, trialInterventionGuid))
        {
            return StatusConflicted();
        }

        var originalTrialIntervention = await _trialInterventionService.GetTrialIntervention(trialInterventionGuid);
        if (originalTrialIntervention != null)
        {
            var trialInterventionToPatch = _mapper.Map<Data.Model.TrialIntervention, PatchTrialInterventionRequest>(originalTrialIntervention);
            request.ApplyTo(trialInterventionToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var interventionTrialStatus = request.GetValue<byte?>("/intervention_status");
            if (interventionTrialStatus.Exists)
            {
                if (!interventionTrialStatus.Value.HasValue)
                {
                    return BadRequest(ApiReturnMessages.InterventionTrialStatusRequired);
                }
            }

            var result = await _trialInterventionService.PatchAsync(trialInterventionGuid, trialInterventionToPatch);

            if (result != null)
            {
                EntityGuidSetContext(trialInterventionGuid);
                return Ok(result);
            }
        }

        return NotFound();
    }

    [HttpDelete("/api/trialintervention/{trialInterventionGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.User, RoleNames.AccessCode, RoleNames.OfficePay })]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Delete(Guid trialInterventionGuid)
    {
        if (CheckModified(_trialInterventionService, trialInterventionGuid))
        {
            return StatusConflicted();
        }

        var result = await _trialInterventionService.DeleteAsync(trialInterventionGuid);
        if (result)
        {
            EntityGuidSetContext(trialInterventionGuid);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }
}