using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.RemedyDetail;
using CM.Business.Services.Parties;
using CM.Business.Services.RemedyDetails;
using CM.Business.Services.RemedyServices;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/issues/remedydetail")]
public class RemedyDetailController : BaseController
{
    private readonly IMapper _mapper;
    private readonly IParticipantService _participantService;
    private readonly IRemedyDetailService _remedyDetailService;
    private readonly IRemedyService _remedyService;

    public RemedyDetailController(IRemedyDetailService remedyDetailService, IRemedyService remedyService, IParticipantService participantService, IMapper mapper)
    {
        _remedyDetailService = remedyDetailService;
        _remedyService = remedyService;
        _participantService = participantService;
        _mapper = mapper;
    }

    [HttpPost("{remedyId:int}")]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Post(int remedyId, [FromBody]RemedyDetailRequest remedyDetail)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var remedyExists = await _remedyService.RemedyExists(remedyId);
        if (!remedyExists)
        {
            return BadRequest(string.Format(ApiReturnMessages.RemedyDoesNotExist, remedyId));
        }

        if (remedyDetail.DescriptionBy != 0)
        {
            var participantExists = await _participantService.ParticipantExists(remedyDetail.DescriptionBy);
            if (!participantExists)
            {
                return BadRequest(string.Format(ApiReturnMessages.ParticipantDoesNotExist, remedyDetail.DescriptionBy));
            }
        }

        await DisputeResolveAndSetContext(_remedyService, remedyId);
        var newRemedyDetails = await _remedyDetailService.CreateAsync(remedyId, remedyDetail);
        EntityIdSetContext(newRemedyDetails.RemedyDetailId);
        return Ok(newRemedyDetails);
    }

    [HttpPatch("{remedyDetailId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Patch(int remedyDetailId, [FromBody]JsonPatchDocumentExtension<RemedyDetailRequest> remedyDetail)
    {
        if (CheckModified(_remedyDetailService, remedyDetailId))
        {
            return StatusConflicted();
        }

        var originalRemedyDetail = await _remedyDetailService.GetNoTrackingRemedyDetailAsync(remedyDetailId);
        if (originalRemedyDetail != null)
        {
            var remedyDetailToPatch = _mapper.Map<RemedyDetail, RemedyDetailRequest>(originalRemedyDetail);
            remedyDetail.ApplyTo(remedyDetailToPatch);

            var participantId = remedyDetail.GetValue<int>("/description_by");
            if (participantId.Exists && !await _participantService.ParticipantExists(participantId.Value))
            {
                return BadRequest(string.Format(ApiReturnMessages.ParticipantDoesNotExist, participantId.Value));
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await DisputeResolveAndSetContext(_remedyDetailService, remedyDetailId);
            _mapper.Map(remedyDetailToPatch, originalRemedyDetail);
            var result = await _remedyDetailService.PatchAsync(originalRemedyDetail);

            if (result != null)
            {
                EntityIdSetContext(remedyDetailId);
                return Ok(_mapper.Map<RemedyDetail, RemedyDetailResponse>(result));
            }
        }

        return NotFound();
    }

    [HttpDelete("{remedyDetailId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Delete(int remedyDetailId)
    {
        if (CheckModified(_remedyDetailService, remedyDetailId))
        {
            return StatusConflicted();
        }

        await DisputeResolveAndSetContext(_remedyDetailService, remedyDetailId);
        var result = await _remedyDetailService.DeleteAsync(remedyDetailId);
        if (result)
        {
            EntityIdSetContext(remedyDetailId);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }
}