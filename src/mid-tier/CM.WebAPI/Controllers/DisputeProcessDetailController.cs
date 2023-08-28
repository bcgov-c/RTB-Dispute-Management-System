using System;
using System.Threading.Tasks;
using CM.Business.Entities.Models.DisputeProcessDetail;
using CM.Business.Services.DisputeProcessDetail;
using CM.Business.Services.DisputeServices;
using CM.Business.Services.Parties;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Route("api/dispute/processdetail")]
[Produces(Application.Json)]
[AuthorizationRequired(new[] { RoleNames.Admin })]
public class DisputeProcessDetailController : BaseController
{
    private readonly IDisputeProcessDetailService _disputeProcessDetailService;
    private readonly IDisputeService _disputeService;
    private readonly IParticipantService _participantService;

    public DisputeProcessDetailController(IDisputeProcessDetailService disputeProcessDetailService, IDisputeService disputeService, IParticipantService participantService)
    {
        _disputeProcessDetailService = disputeProcessDetailService;
        _disputeService = disputeService;
        _participantService = participantService;
    }

    [HttpPost("{disputeGuid:Guid}")]
    public async Task<IActionResult> Post(Guid disputeGuid, [FromBody]DisputeProcessDetailPostRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var disputeExists = await _disputeService.DisputeExistsAsync(disputeGuid);
        if (!disputeExists)
        {
            return BadRequest(string.Format(ApiReturnMessages.DisputeDoesNotExist, disputeGuid));
        }

        var disputeStatusExists = await _disputeService.DisputeStatusExistsAsync(request.StartDisputeStatusId);
        if (!disputeStatusExists)
        {
            return BadRequest(string.Format(ApiReturnMessages.DisputeStatusDoesNotExist, request.StartDisputeStatusId));
        }

        if (request.ProcessApplicant1Id != null)
        {
            var participantExists = await _participantService.ParticipantExists(request.ProcessApplicant1Id);
            if (!participantExists)
            {
                return BadRequest(string.Format(ApiReturnMessages.ParticipantDoesNotExist, request.ProcessApplicant1Id));
            }
        }

        if (request.ProcessApplicant2Id != null)
        {
            var participantExists = await _participantService.ParticipantExists(request.ProcessApplicant2Id);
            if (!participantExists)
            {
                return BadRequest(string.Format(ApiReturnMessages.ParticipantDoesNotExist, request.ProcessApplicant2Id));
            }
        }

        var associatedProcessIsUsed =
            await _disputeProcessDetailService.AssociatedProcessIsUsed(request.AssociatedProcess, disputeGuid);
        if (!associatedProcessIsUsed)
        {
            return BadRequest(ApiReturnMessages.AssociatedProcessMustBeUsed);
        }

        DisputeSetContext(disputeGuid);
        var result = await _disputeProcessDetailService.CreateAsync(disputeGuid, request);
        EntityIdSetContext(result.DisputeProcessDetailId);
        return Ok(result);
    }

    [HttpPatch("{disputeProcessDetailId:int}")]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Patch(int disputeProcessDetailId, [FromBody]JsonPatchDocumentExtension<DisputeProcessDetailPatchRequest> request)
    {
        if (CheckModified(_disputeProcessDetailService, disputeProcessDetailId))
        {
            return StatusConflicted();
        }

        var disputeProcessDetailPatch = await _disputeProcessDetailService.GetForPatchAsync(disputeProcessDetailId);
        if (disputeProcessDetailPatch != null)
        {
            request.ApplyTo(disputeProcessDetailPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var disputeStatusId = request.GetValue<int>("/start_dispute_status_id");
            if (disputeStatusId.Exists && !await _participantService.ParticipantExists(disputeStatusId.Value))
            {
                return BadRequest(string.Format(ApiReturnMessages.DisputeStatusDoesNotExist, disputeStatusId.Value));
            }

            var processApplicant1Id = request.GetValue<int>("/process_applicant1_id");
            if (processApplicant1Id.Exists && !await _participantService.ParticipantExists(processApplicant1Id.Value))
            {
                return BadRequest(string.Format(ApiReturnMessages.ParticipantDoesNotExist, processApplicant1Id.Value));
            }

            var processApplicant2Id = request.GetValue<int>("/process_applicant2_id");
            if (processApplicant2Id.Exists && !await _participantService.ParticipantExists(processApplicant2Id.Value))
            {
                return BadRequest(string.Format(ApiReturnMessages.ParticipantDoesNotExist, processApplicant2Id.Value));
            }

            await DisputeResolveAndSetContext(_disputeProcessDetailService, disputeProcessDetailId);
            var result = await _disputeProcessDetailService.PatchAsync(disputeProcessDetailId, disputeProcessDetailPatch);
            if (result != null)
            {
                EntityIdSetContext(disputeProcessDetailId);
                return Ok(result);
            }
        }

        return NotFound();
    }

    [HttpDelete("{disputeProcessDetailId:int}")]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Delete(int disputeProcessDetailId)
    {
        if (CheckModified(_disputeProcessDetailService, disputeProcessDetailId))
        {
            return StatusConflicted();
        }

        await DisputeResolveAndSetContext(_disputeProcessDetailService, disputeProcessDetailId);
        var result = await _disputeProcessDetailService.DeleteAsync(disputeProcessDetailId);
        if (result)
        {
            EntityIdSetContext(disputeProcessDetailId);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }

    [HttpGet("{disputeProcessDetailId:int}")]
    public async Task<IActionResult> Get(int disputeProcessDetailId)
    {
        var result = await _disputeProcessDetailService.GetByIdAsync(disputeProcessDetailId);
        if (result != null)
        {
            return Ok(result);
        }

        return NotFound();
    }

    [HttpGet("/api/dispute/disputeprocessdetails/{disputeGuid:Guid}")]
    public async Task<IActionResult> GetAll(Guid disputeGuid)
    {
        var result = await _disputeProcessDetailService.GetAllAsync(disputeGuid);
        return Ok(result);
    }
}