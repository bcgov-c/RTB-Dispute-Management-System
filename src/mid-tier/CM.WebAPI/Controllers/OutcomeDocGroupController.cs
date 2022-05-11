using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.OutcomeDocument;
using CM.Business.Services.DisputeServices;
using CM.Business.Services.OutcomeDocument;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.WebAPI.Filters;
using CM.WebAPI.WebApiHelpers;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Route("api/outcomedocgroup")]
[Produces(Application.Json)]
[AuthorizationRequired(new[] { RoleNames.Admin })]
public class OutcomeDocGroupController : BaseController
{
    private readonly IDisputeService _disputeService;
    private readonly IMapper _mapper;
    private readonly IOutcomeDocGroupService _outcomeDocGroupService;

    public OutcomeDocGroupController(IOutcomeDocGroupService outcomeDocGroupService, IDisputeService disputeService, IMapper mapper)
    {
        _outcomeDocGroupService = outcomeDocGroupService;
        _disputeService = disputeService;
        _mapper = mapper;
    }

    [HttpPost("{disputeGuid:Guid}")]
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
    public async Task<IActionResult> GetAll(Guid disputeGuid)
    {
        var outcomeDocGroups = await _outcomeDocGroupService.GetAllAsync(disputeGuid);
        return Ok(outcomeDocGroups);
    }
}