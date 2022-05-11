using System;
using System.Threading.Tasks;
using CM.Business.Entities.Models.Claim;
using CM.Business.Services.Claims;
using CM.Business.Services.Parties;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using CM.WebAPI.WebApiHelpers;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/issues/claim")]
public class ClaimController : BaseController
{
    private readonly IClaimGroupService _claimGroupService;
    private readonly IClaimService _claimService;

    public ClaimController(IClaimService claimService, IClaimGroupService claimGroupService)
    {
        _claimService = claimService;
        _claimGroupService = claimGroupService;
    }

    [HttpPost("{claimGroupId:int}")]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Post(int claimGroupId, [FromBody]ClaimRequest claim)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var claimGroupExists = await _claimGroupService.ClaimGroupExists(claimGroupId);
        if (!claimGroupExists)
        {
            return BadRequest(string.Format(ApiReturnMessages.ClaimGroupDoesNotExist, claimGroupId));
        }

        await DisputeResolveAndSetContext(_claimGroupService, claimGroupId);
        var newClaim = await _claimService.CreateAsync(claimGroupId, claim);
        EntityIdSetContext(newClaim.ClaimId);
        return Ok(newClaim);
    }

    [HttpPatch("{claimId:int}")]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Patch(int claimId, [FromBody]JsonPatchDocumentExtension<ClaimRequest> claim)
    {
        if (CheckModified(_claimService, claimId))
        {
            return StatusConflicted();
        }

        var claimToPatch = await _claimService.GetForPatchAsync(claimId);
        if (claimToPatch != null)
        {
            claim.ApplyTo(claimToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await DisputeResolveAndSetContext(_claimService, claimId);
            var result = await _claimService.PatchAsync(claimId, claimToPatch);

            if (result != null)
            {
                EntityIdSetContext(claimId);
                return Ok(result);
            }
        }

        return NotFound();
    }

    [HttpDelete("{claimId:int}")]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Delete(int claimId)
    {
        if (CheckModified(_claimService, claimId))
        {
            return StatusConflicted();
        }

        var childExist = await _claimService.IfChildClaimElementExist(claimId);
        if (childExist)
        {
            return BadRequest(string.Format(ApiReturnMessages.ClaimChildReference, claimId));
        }

        await DisputeResolveAndSetContext(_claimService, claimId);
        var result = await _claimService.DeleteAsync(claimId);
        if (result)
        {
            EntityIdSetContext(claimId);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }

    [HttpGet("{claimId:int}")]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> GetIssueClaim(int claimId)
    {
        var issueClaim = await _claimService.GetIssueClaim(claimId);
        if (issueClaim != null)
        {
            return Ok(issueClaim);
        }

        return NotFound();
    }

    [HttpGet("/api/issues/disputeclaims/{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser })]
    public async Task<IActionResult> GetDisputeClaims(Guid disputeGuid)
    {
        var disputeClaims = await _claimService.GetDisputeClaims(disputeGuid);
        if (disputeClaims != null)
        {
            return Ok(disputeClaims);
        }

        return NotFound();
    }
}