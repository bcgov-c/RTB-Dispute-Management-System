using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Parties;
using CM.Business.Services.Parties;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/parties")]
[AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser })]
public class ClaimGroupParticipantController : BaseController
{
    private readonly IClaimGroupParticipantService _claimGroupParticipantService;
    private readonly IClaimGroupService _claimGroupService;
    private readonly IMapper _mapper;

    public ClaimGroupParticipantController(IClaimGroupParticipantService claimGroupParticipantService, IClaimGroupService claimGroupService, IMapper mapper)
    {
        _claimGroupParticipantService = claimGroupParticipantService;
        _claimGroupService = claimGroupService;
        _mapper = mapper;
    }

    [HttpPost("claimgroupparticipant/{claimGroupId:int}")]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Post(int claimGroupId, [FromBody]List<ClaimGroupParticipantRequest> claimGroupParticipants)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        await DisputeResolveAndSetContext(_claimGroupService, claimGroupId);
        var result = await _claimGroupParticipantService.CreateAsync(claimGroupId, claimGroupParticipants);
        EntityIdSetContext(result.First().ClaimGroupParticipantId);
        return Ok(result);
    }

    [HttpDelete("claimgroupparticipant/{groupParticipantId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Delete(int groupParticipantId)
    {
        if (CheckModified(_claimGroupParticipantService, groupParticipantId))
        {
            return StatusConflicted();
        }

        await DisputeResolveAndSetContext(_claimGroupParticipantService, groupParticipantId);
        var result = await _claimGroupParticipantService.DeleteAsync(groupParticipantId);
        if (result)
        {
            EntityIdSetContext(groupParticipantId);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }

    [HttpPatch("claimgroupparticipant/{groupParticipantId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Patch(int groupParticipantId, [FromBody]JsonPatchDocumentExtension<ClaimGroupParticipantRequest> claimGroupParticipant)
    {
        if (CheckModified(_claimGroupParticipantService, groupParticipantId))
        {
            return StatusConflicted();
        }

        var originalClaimGroupParticipant = await _claimGroupParticipantService.GetNoTrackingClaimGroupParticipantsAsync(groupParticipantId);
        if (originalClaimGroupParticipant != null)
        {
            var claimGroupParticipantToPatch = _mapper.Map<ClaimGroupParticipant, ClaimGroupParticipantRequest>(originalClaimGroupParticipant);
            claimGroupParticipant.ApplyTo(claimGroupParticipantToPatch);

            await TryUpdateModelAsync(claimGroupParticipantToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await DisputeResolveAndSetContext(_claimGroupParticipantService, groupParticipantId);
            _mapper.Map(claimGroupParticipantToPatch, originalClaimGroupParticipant);
            originalClaimGroupParticipant.ClaimGroupParticipantId = groupParticipantId;
            var result = await _claimGroupParticipantService.PatchAsync(originalClaimGroupParticipant);
            EntityIdSetContext(groupParticipantId);
            return Ok(result);
        }

        return NotFound();
    }

    [HttpGet("disputeclaimgroupparticipants/{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser })]
    public async Task<IActionResult> GetClaimGroupParticipants(Guid disputeGuid)
    {
        var disputeClaimGroupParticipants = await
            _claimGroupParticipantService.GetDisputeClaimParticipantsAsync(disputeGuid);

        return Ok(disputeClaimGroupParticipants);
    }
}