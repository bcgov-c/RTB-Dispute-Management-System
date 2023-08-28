using System;
using System.Threading.Tasks;
using CM.Business.Entities.Models.Payment;
using CM.Business.Services.Parties;
using CM.Business.Services.Payment;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/disputefee")]
public class DisputeFeeController : BaseController
{
    private readonly IDisputeFeeService _disputeFeeService;
    private readonly IParticipantService _participantService;

    public DisputeFeeController(IDisputeFeeService deDisputeFeeService, IParticipantService participantService)
    {
        _disputeFeeService = deDisputeFeeService;
        _participantService = participantService;
    }

    [HttpPost("{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser, RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> Post(Guid disputeGuid, [FromBody]PostDisputeFeeRequest disputeFee)
    {
        if (disputeFee.PayorId.HasValue)
        {
            var participantExists = await _participantService.ParticipantExists(disputeFee.PayorId.Value);
            if (!participantExists)
            {
                return BadRequest(string.Format(ApiReturnMessages.ParticipantDoesNotExist, disputeFee.PayorId));
            }
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        DisputeSetContext(disputeGuid);
        var newDisputeService = await _disputeFeeService.CreateAsync(disputeGuid, disputeFee);
        EntityIdSetContext(newDisputeService.DisputeFeeId);
        return Ok(newDisputeService);
    }

    [HttpPatch("{disputeFeeId:int}")]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser, RoleNames.OfficePay })]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Patch(int disputeFeeId, [FromBody]JsonPatchDocumentExtension<PatchDisputeFeeRequest> disputeFee)
    {
        if (CheckModified(_disputeFeeService, disputeFeeId))
        {
            return StatusConflicted();
        }

        var disputeFeeToPatch = await _disputeFeeService.GetForPatchAsync(disputeFeeId);
        if (disputeFeeToPatch != null)
        {
            disputeFee.ApplyTo(disputeFeeToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var participantId = disputeFee.GetValue<int>("/payor_id");
            if (participantId.Exists && !await _participantService.ParticipantExists(participantId.Value))
            {
                return BadRequest(string.Format(ApiReturnMessages.ParticipantDoesNotExist, participantId.Value));
            }

            await DisputeResolveAndSetContext(_disputeFeeService, disputeFeeId);
            var result = await _disputeFeeService.PatchAsync(disputeFeeId, disputeFeeToPatch);

            if (result != null)
            {
                EntityIdSetContext(disputeFeeId);
                return Ok(result);
            }
        }

        return NotFound();
    }

    [HttpDelete("{disputeFeeId:int}")]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited })]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Delete(int disputeFeeId)
    {
        await DisputeResolveAndSetContext(_disputeFeeService, disputeFeeId);
        if (CheckModified(_disputeFeeService, disputeFeeId))
        {
            return StatusConflicted();
        }

        if (await _disputeFeeService.ChildElementExists(disputeFeeId))
        {
            return BadRequest(string.Format(ApiReturnMessages.DisputeFeeChildReference, disputeFeeId));
        }

        await DisputeResolveAndSetContext(_disputeFeeService, disputeFeeId);
        var result = await _disputeFeeService.DeleteAsync(disputeFeeId);
        if (result)
        {
            EntityIdSetContext(disputeFeeId);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }

    [HttpGet("{disputeFeeId:int}")]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Get(int disputeFeeId)
    {
        var disputeFee = await _disputeFeeService.GetAsync(disputeFeeId);
        if (disputeFee != null)
        {
            return Ok(disputeFee);
        }

        return NotFound();
    }

    [HttpGet("/api/disputefees/{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser })]
    public async Task<IActionResult> GetByDisputeGuid(Guid disputeGuid)
    {
        var disputeFeeList = await _disputeFeeService.GetList(disputeGuid);
        return Ok(disputeFeeList);
    }
}