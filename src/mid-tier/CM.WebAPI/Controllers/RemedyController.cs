using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Remedy;
using CM.Business.Services.Claims;
using CM.Business.Services.RemedyServices;
using CM.Business.Services.UserServices;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.WebAPI.Filters;
using CM.WebAPI.WebApiHelpers;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/issues/remedy")]
public class RemedyController : BaseController
{
    private readonly IClaimService _claimService;
    private readonly IMapper _mapper;
    private readonly IRemedyService _remedyService;
    private readonly IUserService _userService;

    public RemedyController(IRemedyService remedyService, IClaimService claimService, IUserService userService, IMapper mapper)
    {
        _remedyService = remedyService;
        _claimService = claimService;
        _userService = userService;
        _mapper = mapper;
    }

    [HttpPost("{claimId:int}")]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Post(int claimId, [FromBody]RemedyRequest remedy)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var claimExists = await _claimService.ClaimExists(claimId);
        if (!claimExists)
        {
            return BadRequest(string.Format(ApiReturnMessages.ClaimDoesNotExist, claimId));
        }

        await DisputeResolveAndSetContext(_claimService, claimId);
        var newRemedy = await _remedyService.CreateAsync(claimId, remedy);
        EntityIdSetContext(newRemedy.RemedyId);
        return Ok(newRemedy);
    }

    [HttpPatch("{remedyId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Patch(int remedyId, [FromBody]JsonPatchDocumentExtension<RemedyRequest> remedy)
    {
        if (CheckModified(_remedyService, remedyId))
        {
            return StatusConflicted();
        }

        var originalRemedy = await _remedyService.GetNoTrackingRemedyAsync(remedyId);
        if (originalRemedy != null)
        {
            var remedyToPatch = _mapper.Map<Remedy, RemedyRequest>(originalRemedy);
            remedy.ApplyTo(remedyToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var(exists, prevAwardBy) = remedy.GetValue<int?>("/prev_award_by");
            if (exists)
            {
                var isPrevAwardByActiveAdmin = await _userService.UserIsActiveAdmin(prevAwardBy.Value);
                if (!isPrevAwardByActiveAdmin)
                {
                    return BadRequest(ApiReturnMessages.PrevAwardByInvalidRole);
                }
            }

            await DisputeResolveAndSetContext(_remedyService, remedyId);
            _mapper.Map(remedyToPatch, originalRemedy);

            var result = await _remedyService.PatchAsync(originalRemedy);

            if (result != null)
            {
                EntityIdSetContext(remedyId);
                return Ok(_mapper.Map<Remedy, RemedyResponse>(result));
            }
        }

        return NotFound();
    }

    [HttpDelete("{remedyId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Delete(int remedyId)
    {
        if (CheckModified(_remedyService, remedyId))
        {
            return StatusConflicted();
        }

        var childExists = await _remedyService.IfChildElementExist(remedyId);
        if (childExists)
        {
            return BadRequest(string.Format(ApiReturnMessages.RemedyChildReference, remedyId));
        }

        await DisputeResolveAndSetContext(_remedyService, remedyId);
        var result = await _remedyService.DeleteAsync(remedyId);
        if (result)
        {
            EntityIdSetContext(remedyId);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }
}