using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.OutcomeDocument;
using CM.Business.Services.DisputeServices;
using CM.Business.Services.OutcomeDocument;
using CM.Business.Services.Parties;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Route("api/outcomedocgroup")]
[Produces(Application.Json)]
public class OutcomeDocGroupController : BaseController
{
    private readonly IDisputeService _disputeService;
    private readonly IParticipantService _participantService;
    private readonly IMapper _mapper;
    private readonly IOutcomeDocGroupService _outcomeDocGroupService;

    public OutcomeDocGroupController(IOutcomeDocGroupService outcomeDocGroupService, IDisputeService disputeService, IMapper mapper, IParticipantService participantService)
    {
        _outcomeDocGroupService = outcomeDocGroupService;
        _disputeService = disputeService;
        _mapper = mapper;
        _participantService = participantService;
    }

    [HttpPost("{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> Post(Guid disputeGuid, [FromBody]OutcomeDocGroupRequest outcomeDocGroup)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var disputeExist = await _disputeService.DisputeExistsAsync(disputeGuid);
        if (!disputeExist)
        {
            return BadRequest(string.Format(ApiReturnMessages.DisputeDoesNotExist, disputeGuid));
        }

        DisputeSetContext(disputeGuid);
        var result = await _outcomeDocGroupService.CreateAsync(disputeGuid, outcomeDocGroup);
        EntityIdSetContext(result.OutcomeDocGroupId);
        return Ok(result);
    }

    [HttpPatch("{outcomeDocGroupId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> Patch(int outcomeDocGroupId, [FromBody]JsonPatchDocumentExtension<OutcomeDocGroupPatchRequest> outcomeDocGroup)
    {
        if (CheckModified(_outcomeDocGroupService, outcomeDocGroupId))
        {
            return StatusConflicted();
        }

        var originalOutcomeDocGroup = await _outcomeDocGroupService.GetNoTrackingOutcomeDocGroupAsync(outcomeDocGroupId);
        if (originalOutcomeDocGroup != null)
        {
            var docStatus = outcomeDocGroup.GetValue<string>("/doc_status");
            if (docStatus.Exists)
            {
                originalOutcomeDocGroup.DocStatusDate = DateTime.UtcNow;
            }

            var outcomeDocGroupToPatch = _mapper.Map<OutcomeDocGroup, OutcomeDocGroupPatchRequest>(originalOutcomeDocGroup);
            outcomeDocGroup.ApplyTo(outcomeDocGroupToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await DisputeResolveAndSetContext(_outcomeDocGroupService, outcomeDocGroupId);
            _mapper.Map(outcomeDocGroupToPatch, originalOutcomeDocGroup);
            var result = await _outcomeDocGroupService.PatchAsync(originalOutcomeDocGroup);

            if (result != null)
            {
                EntityIdSetContext(outcomeDocGroupId);
                return Ok(_mapper.Map<OutcomeDocGroup, OutcomeDocGroupResponse>(result));
            }
        }

        return NotFound();
    }

    [HttpDelete("{outcomeDocGroupId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> Delete(int outcomeDocGroupId)
    {
        if (CheckModified(_outcomeDocGroupService, outcomeDocGroupId))
        {
            return StatusConflicted();
        }

        await DisputeResolveAndSetContext(_outcomeDocGroupService, outcomeDocGroupId);
        var result = await _outcomeDocGroupService.DeleteAsync(outcomeDocGroupId);
        if (result)
        {
            EntityIdSetContext(outcomeDocGroupId);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }

    [HttpGet("/api/disputeoutcomedocgroup/{outcomeDocGroupId:int}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> GetById(int outcomeDocGroupId)
    {
        var outcomeDocGroup = await _outcomeDocGroupService.GetByIdAsync(outcomeDocGroupId);
        if (outcomeDocGroup != null)
        {
            return Ok(outcomeDocGroup);
        }

        return NotFound();
    }

    [HttpGet("/api/disputeoutcomedocgroups/{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> GetAll(Guid disputeGuid)
    {
        var outcomeDocGroups = await _outcomeDocGroupService.GetAllAsync(disputeGuid);
        return Ok(outcomeDocGroups);
    }

    [HttpGet("/api/externaldisputeoutcomedocgroups/{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser, RoleNames.OfficePay })]
    public async Task<IActionResult> GetExternalOutcomeDocGroups(Guid disputeGuid, ExternalOutcomeDocGroupRequest request)
    {
        var isAssociated = await IsAssociatedToDispute(request.DeliveryParticipantIds, disputeGuid);
        if (request == null || request.DeliveryParticipantIds == null || request.DeliveryParticipantIds.Length < 1 || !isAssociated)
        {
            return BadRequest(ApiReturnMessages.IncorrectDeliveryParticipantIds);
        }

        var externalOutcomeDocGroups = await _outcomeDocGroupService.GetExternalOutcomeDocGroups(disputeGuid, request);
        return Ok(externalOutcomeDocGroups);
    }

    private async Task<bool> IsAssociatedToDispute(int[] deliveryParticipantIds, Guid disputeGuid)
    {
        if (deliveryParticipantIds != null && deliveryParticipantIds.Length > 0)
        {
            foreach (var participantId in deliveryParticipantIds)
            {
                var participant = await _participantService.GetAsync(participantId);
                if (participant == null || participant.DisputeGuid != disputeGuid)
                {
                    return false;
                }
            }

            return true;
        }

        return false;
    }
}