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
using CM.WebAPI.WebApiHelpers;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/parties")]
public class PartiesController : BaseController
{
    private readonly IMapper _mapper;
    private readonly IParticipantService _participantService;

    public PartiesController(IParticipantService participantService, IMapper mapper)
    {
        _participantService = participantService;
        _mapper = mapper;
    }

    [HttpPost("participant/{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Post(Guid disputeGuid, [FromBody]List<ParticipantRequest> request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        DisputeSetContext(disputeGuid);
        var result = await _participantService.CreateManyAsync(disputeGuid, request);
        EntityIdSetContext(result.First().ParticipantId);
        return Ok(result);
    }

    [HttpDelete("participant/{participantId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Delete(int participantId)
    {
        if (CheckModified(_participantService, participantId))
        {
            return StatusConflicted();
        }

        var entityId = await _participantService.RelatedEntity(participantId);
        if (entityId != -1)
        {
            return BadRequest(string.Format(ApiReturnMessages.ParticipantReference, entityId));
        }

        await DisputeResolveAndSetContext(_participantService, participantId);
        var result = await _participantService.DeleteAsync(participantId);
        if (result)
        {
            EntityIdSetContext(participantId);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }

    [HttpPatch("participant/{participantId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Patch(int participantId, [FromBody]JsonPatchDocumentExtension<ParticipantRequest> participant)
    {
        if (CheckModified(_participantService, participantId))
        {
            return StatusConflicted();
        }

        var originalParty = await _participantService.GetByIdAsync(participantId);
        if (originalParty != null)
        {
            try
            {
                var patchType = DeterminePartyPatchType(participant, originalParty);

                var participantToPatch = _mapper.Map<Participant, ParticipantRequest>(originalParty);
                participant.ApplyTo(participantToPatch);

                await TryUpdateModelAsync(participantToPatch);

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                await DisputeResolveAndSetContext(_participantService, participantId);
                _mapper.Map(participantToPatch, originalParty);
                originalParty.ParticipantId = participantId;
                var result = await _participantService.PatchAsync(originalParty, patchType);
                EntityIdSetContext(participantId);
                return Ok(_mapper.Map<Participant, ParticipantResponse>(result));
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }
        }

        return NotFound();
    }

    [HttpGet("participant/{participantId:int}")]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Get(int participantId)
    {
        var participant = await _participantService.GetAsync(participantId);
        if (participant != null)
        {
            return Ok(participant);
        }

        return NotFound();
    }

    [HttpGet("disputeparticipants/{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser })]
    public async Task<IActionResult> GetDisputeParticipants(Guid disputeGuid)
    {
        var participants = await _participantService.GetAllAsync(disputeGuid);
        return Ok(participants);
    }

    private PartyPatchType DeterminePartyPatchType(JsonPatchDocumentExtension<ParticipantRequest> participant, Participant originalParty)
    {
        var(exists, value) = participant.GetValue<int>("/participant_status");

        if (exists)
        {
            if ((value == (byte)ParticipantStatus.Removed || value == (byte)ParticipantStatus.Deleted)
                && (originalParty.ParticipantStatus != (byte)ParticipantStatus.Removed || originalParty.ParticipantStatus != (byte)ParticipantStatus.Deleted))
            {
                return PartyPatchType.SoftDelete;
            }

            if ((value != (byte)ParticipantStatus.Removed || value != (byte)ParticipantStatus.Deleted)
                && (originalParty.ParticipantStatus == (byte)ParticipantStatus.Removed || originalParty.ParticipantStatus == (byte)ParticipantStatus.Deleted))
            {
                return PartyPatchType.SoftUndelete;
            }
        }

        return PartyPatchType.Null;
    }
}