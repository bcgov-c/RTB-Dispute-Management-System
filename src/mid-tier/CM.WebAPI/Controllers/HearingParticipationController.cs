using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Hearing;
using CM.Business.Services.Hearings;
using CM.Business.Services.Parties;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.WebAPI.Filters;
using CM.WebAPI.WebApiHelpers;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/hearingparticipation")]
[AuthorizationRequired(new[] { RoleNames.Admin })]
public class HearingParticipationController : BaseController
{
    private readonly IHearingParticipationService _hearingParticipationService;
    private readonly IHearingService _hearingService;
    private readonly IMapper _mapper;
    private readonly IParticipantService _participantService;

    public HearingParticipationController(IHearingParticipationService hearingParticipationService, IParticipantService participantService, IHearingService hearingService, IMapper mapper)
    {
        _hearingParticipationService = hearingParticipationService;
        _participantService = participantService;
        _hearingService = hearingService;
        _mapper = mapper;
    }

    [HttpPost("{hearingId:int}")]
    public async Task<IActionResult> Post(int hearingId, [FromBody]HearingParticipationRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (request.ParticipantId != null)
        {
            var isParticipantExists = await _participantService.ParticipantExists((int)request.ParticipantId);
            if (!isParticipantExists)
            {
                return BadRequest(string.Format(ApiReturnMessages.ParticipantDoesNotExist, request.ParticipantId));
            }
        }

        var isHearingExists = await _hearingService.HearingExists(hearingId);
        if (!isHearingExists)
        {
            return BadRequest(string.Format(ApiReturnMessages.HearingDoesNotExist, hearingId));
        }

        var result = await _hearingParticipationService.CreateAsync(hearingId, request);
        EntityIdSetContext(result.HearingParticipationId);
        return Ok(result);
    }

    [HttpPatch("{hearingParticipationId:int}")]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Patch(int hearingParticipationId, [FromBody]JsonPatchDocumentExtension<HearingParticipationRequest> hearingParticipation)
    {
        if (CheckModified(_hearingParticipationService, hearingParticipationId))
        {
            return StatusConflicted();
        }

        var originalHearingParticipation = await _hearingParticipationService.GetNoTrackingHearingParticipationAsync(hearingParticipationId);
        if (originalHearingParticipation != null)
        {
            var hearingParticipationToPatch = _mapper.Map<HearingParticipation, HearingParticipationRequest>(originalHearingParticipation);
            hearingParticipation.ApplyTo(hearingParticipationToPatch);

            await TryUpdateModelAsync(hearingParticipationToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var participantId = hearingParticipation.GetValue<int>("/participant_id");
            if (participantId.Exists && !await _participantService.ParticipantExists(participantId.Value))
            {
                return BadRequest(string.Format(ApiReturnMessages.ParticipantDoesNotExist, participantId.Value));
            }

            _mapper.Map(hearingParticipationToPatch, originalHearingParticipation);
            originalHearingParticipation.HearingParticipationId = hearingParticipationId;
            var result = await _hearingParticipationService.PatchAsync(originalHearingParticipation);
            EntityIdSetContext(hearingParticipationId);
            return Ok(result);
        }

        return NotFound();
    }

    [HttpDelete("{hearingParticipationId:int}")]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Delete(int hearingParticipationId)
    {
        if (CheckModified(_hearingParticipationService, hearingParticipationId))
        {
            return StatusConflicted();
        }

        var result = await _hearingParticipationService.DeleteAsync(hearingParticipationId);
        if (result)
        {
            EntityIdSetContext(hearingParticipationId);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }
}