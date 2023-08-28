using System.Threading.Tasks;
using CM.Business.Entities.Models.OutcomeDocument;
using CM.Business.Services.EmailMessages;
using CM.Business.Services.OutcomeDocument;
using CM.Business.Services.Parties;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Route("api/outcomedocdelivery")]
[Produces(Application.Json)]
[AuthorizationRequired(new[] { RoleNames.Admin })]
public class OutcomeDocDeliveryController : BaseController
{
    private readonly IOutcomeDocDeliveryService _outcomeDocDeliveryService;
    private readonly IOutcomeDocFileService _outcomeDocFileService;
    private readonly IParticipantService _participantService;
    private readonly IEmailMessageService _emailMessageService;

    public OutcomeDocDeliveryController(IOutcomeDocDeliveryService outcomeDocDeliveryService,
        IOutcomeDocFileService outcomeDocFileService,
        IParticipantService participantService,
        IEmailMessageService emailMessageService)
    {
        _outcomeDocDeliveryService = outcomeDocDeliveryService;
        _outcomeDocFileService = outcomeDocFileService;
        _participantService = participantService;
        _emailMessageService = emailMessageService;
    }

    [HttpPost("{outcomeDocFileId:int}")]
    public async Task<IActionResult> Post(int outcomeDocFileId, [FromBody]OutcomeDocDeliveryPostRequest outcomeDocDelivery)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var outcomeDocFileExist = await _outcomeDocFileService.OutcomeDocFileExists(outcomeDocFileId);
        if (!outcomeDocFileExist)
        {
            return BadRequest(string.Format(ApiReturnMessages.OutcomeDocFileDoesNotExist, outcomeDocFileId));
        }

        if (outcomeDocDelivery.AssociatedEmailId != null)
        {
            var emailMessageExists = await _emailMessageService.EmailMessageExists(outcomeDocDelivery.AssociatedEmailId, outcomeDocDelivery.DisputeGuid);
            if (!emailMessageExists)
            {
                return BadRequest(string.Format(ApiReturnMessages.EmailMessageDoesNotExist, outcomeDocDelivery.AssociatedEmailId));
            }
        }

        if (outcomeDocDelivery.ParticipantId != null)
        {
            var participantExists = await _participantService.ParticipantExists(outcomeDocDelivery.ParticipantId);
            if (!participantExists)
            {
                return BadRequest(string.Format(ApiReturnMessages.ParticipantDoesNotExist, outcomeDocDelivery.ParticipantId));
            }

            var isDuplicateRecord = await _outcomeDocDeliveryService.IsDuplicateByParticipantId(outcomeDocDelivery.DisputeGuid, outcomeDocDelivery.ParticipantId, outcomeDocFileId);
            if (isDuplicateRecord)
            {
                return BadRequest(string.Format(ApiReturnMessages.DuplicateOutcomeDocDeliveryRecordByParticipantAndFileId, outcomeDocDelivery.ParticipantId, outcomeDocFileId));
            }
        }

        await DisputeResolveAndSetContext(_outcomeDocFileService, outcomeDocFileId);
        var result = await _outcomeDocDeliveryService.CreateAsync(outcomeDocFileId, outcomeDocDelivery);
        EntityIdSetContext(result.OutcomeDocDeliveryId);
        return Ok(result);
    }

    [HttpPatch("{outcomeDocDeliveryId:int}")]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Patch(int outcomeDocDeliveryId, [FromBody]JsonPatchDocumentExtension<OutcomeDocDeliveryPatchRequest> outcomeDocDelivery)
    {
        if (CheckModified(_outcomeDocDeliveryService, outcomeDocDeliveryId))
        {
            return StatusConflicted();
        }

        var outcomeDocDeliveryToPatch = await _outcomeDocDeliveryService.GetForPatchAsync(outcomeDocDeliveryId);
        if (outcomeDocDeliveryToPatch != null)
        {
            outcomeDocDelivery.ApplyTo(outcomeDocDeliveryToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var associatedEmailId = outcomeDocDelivery.GetValue<int?>("/associated_email_id");
            if (associatedEmailId.Exists && associatedEmailId.Value != null && !await _emailMessageService.EmailMessageExists(associatedEmailId.Value, outcomeDocDeliveryToPatch.DisputeGuid))
            {
                return BadRequest(string.Format(ApiReturnMessages.EmailMessageDoesNotExist, associatedEmailId.Value));
            }

            await DisputeResolveAndSetContext(_outcomeDocDeliveryService, outcomeDocDeliveryId);

            var result = await _outcomeDocDeliveryService.PatchAsync(outcomeDocDeliveryId, outcomeDocDeliveryToPatch);
            if (result != null)
            {
                EntityIdSetContext(outcomeDocDeliveryId);
                return Ok(result);
            }
        }

        return NotFound();
    }

    [HttpDelete("{outcomeDocDeliveryId:int}")]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Delete(int outcomeDocDeliveryId)
    {
        if (CheckModified(_outcomeDocDeliveryService, outcomeDocDeliveryId))
        {
            return StatusConflicted();
        }

        await DisputeResolveAndSetContext(_outcomeDocDeliveryService, outcomeDocDeliveryId);
        var result = await _outcomeDocDeliveryService.DeleteAsync(outcomeDocDeliveryId);
        if (result)
        {
            EntityIdSetContext(outcomeDocDeliveryId);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }

    [HttpGet("undelivered")]
    public async Task<IActionResult> GetUndelivered(OutcomeDocDeliveryGetRequest request, int index, int count)
    {
        var result = await _outcomeDocDeliveryService.GetAll(request, index, count);
        return Ok(result);
    }
}