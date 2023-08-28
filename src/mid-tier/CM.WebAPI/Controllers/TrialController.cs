using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Trial;
using CM.Business.Services.Trial;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
public class TrialController : BaseController
{
    private readonly IMapper _mapper;
    private readonly ITrialService _trialService;

    public TrialController(IMapper mapper, ITrialService trialService)
    {
        _trialService = trialService;
        _mapper = mapper;
    }

    [HttpPost("api/trial")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> Post([FromBody] PostTrialRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (request.AssociatedTrialGuid.HasValue)
        {
            var trial = await _trialService.GetTrial(request.AssociatedTrialGuid.Value);
            if (trial == null)
            {
                return BadRequest(ApiReturnMessages.AssociatedTrialInvalid);
            }
        }

        var newTrial = await _trialService.CreateAsync(request);
        EntityGuidSetContext(newTrial.TrialGuid);
        return Ok(newTrial);
    }

    [ApplyConcurrencyCheck]
    [HttpPatch("api/trial/{trialGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> Patch(Guid trialGuid, [FromBody] JsonPatchDocumentExtension<PatchTrialRequest> request)
    {
        if (CheckModified(_trialService, trialGuid))
        {
            return StatusConflicted();
        }

        var originalTrial = await _trialService.GetTrial(trialGuid);
        if (originalTrial != null)
        {
            var trialToPatch = _mapper.Map<Data.Model.Trial, PatchTrialRequest>(originalTrial);
            request.ApplyTo(trialToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var associatedTrialGuid = request.GetValue<Guid?>("/associated_trial_guid");
            if (associatedTrialGuid.Exists)
            {
                var trial = await _trialService.GetTrial(associatedTrialGuid.Value.GetValueOrDefault());
                if (trial == null)
                {
                    return BadRequest(ApiReturnMessages.AssociatedTrialInvalid);
                }
            }

            var result = await _trialService.PatchAsync(trialGuid, trialToPatch);

            if (result != null)
            {
                EntityGuidSetContext(trialGuid);
                return Ok(result);
            }
        }

        return NotFound();
    }

    [HttpDelete("/api/trial/{trialGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Delete(Guid trialGuid)
    {
        if (CheckModified(_trialService, trialGuid))
        {
            return StatusConflicted();
        }

        var result = await _trialService.DeleteAsync(trialGuid);
        if (result)
        {
            EntityGuidSetContext(trialGuid);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }

    [HttpGet("/api/trials/")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.User, RoleNames.AccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> GetAll()
    {
        var trials = await _trialService.GetAll();
        if (trials != null)
        {
            return Ok(trials);
        }

        return NotFound();
    }

    [HttpGet("/api/external/disputetrialsinfo/{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser, RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> GetDisputeTrials(Guid disputeGuid)
    {
        var trials = await _trialService.GetDisputeTrials(disputeGuid);
        if (trials != null)
        {
            return Ok(trials);
        }

        return NotFound();
    }
}