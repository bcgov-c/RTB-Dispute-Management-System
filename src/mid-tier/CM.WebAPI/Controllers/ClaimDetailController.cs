using System.Threading.Tasks;
using CM.Business.Entities.Models.ClaimDetail;
using CM.Business.Services.ClaimDetails;
using CM.Business.Services.Claims;
using CM.Business.Services.Parties;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using CM.WebAPI.WebApiHelpers;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/issues/claimdetail")]
public class ClaimDetailController : BaseController
{
    private readonly IClaimDetailService _claimDetailService;
    private readonly IClaimService _claimService;
    private readonly IParticipantService _participantService;

    public ClaimDetailController(IClaimDetailService claimDetailService, IClaimService claimService, IParticipantService participantService)
    {
        _claimDetailService = claimDetailService;
        _claimService = claimService;
        _participantService = participantService;
    }

    [HttpPost("{claimId:int}")]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Post(int claimId, [FromBody]ClaimDetailRequest claimDetail)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (claimDetail.DescriptionBy != 0)
        {
            var participantExists = await _participantService.ParticipantExists(claimDetail.DescriptionBy);
            if (!participantExists)
            {
                return BadRequest(string.Format(ApiReturnMessages.ParticipantDoesNotExist, claimDetail.DescriptionBy));
            }
        }

        var claimExists = await _claimService.ClaimExists(claimId);
        if (!claimExists)
        {
            return BadRequest(string.Format(ApiReturnMessages.ClaimDoesNotExist, claimId));
        }

        await DisputeResolveAndSetContext(_claimService, claimId);
        var newClaimDetail = await _claimDetailService.CreateAsync(claimId, claimDetail);
        EntityIdSetContext(newClaimDetail.ClaimDetailId);
        return Ok(newClaimDetail);
    }

    [HttpPatch("{claimDetailId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Patch(int claimDetailId, [FromBody]JsonPatchDocumentExtension<ClaimDetailRequest> claimDetail)
    {
        if (CheckModified(_claimDetailService, claimDetailId))
        {
            return StatusConflicted();
        }

        var claimDetailToPatch = await _claimDetailService.GetForPatchAsync(claimDetailId);
        if (claimDetailToPatch != null)
        {
            claimDetail.ApplyTo(claimDetailToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var participantId = claimDetail.GetValue<int>("/description_by");
            if (participantId.Exists && !await _participantService.ParticipantExists(participantId.Value))
            {
                return BadRequest(string.Format(ApiReturnMessages.ParticipantDoesNotExist, participantId.Value));
            }

            await DisputeResolveAndSetContext(_claimDetailService, claimDetailId);
            var result = await _claimDetailService.PatchAsync(claimDetailId, claimDetailToPatch);

            if (result != null)
            {
                EntityIdSetContext(claimDetailId);
                return Ok(result);
            }
        }

        return NotFound();
    }

    [HttpDelete("{claimDetailId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Delete(int claimDetailId)
    {
        if (CheckModified(_claimDetailService, claimDetailId))
        {
            return StatusConflicted();
        }

        await DisputeResolveAndSetContext(_claimDetailService, claimDetailId);
        var result = await _claimDetailService.DeleteAsync(claimDetailId);
        if (result)
        {
            EntityIdSetContext(claimDetailId);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }
}