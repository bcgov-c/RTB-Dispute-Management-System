using System;
using System.Net;
using System.Threading.Tasks;
using CM.Business.Entities.Models.EmailMessage;
using CM.Business.Services.EmailMessages;
using CM.Business.Services.Parties;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using CM.WebAPI.WebApiHelpers;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/emailmessage")]
public class EmailMessageController : BaseController
{
    private readonly IEmailMessageService _emailMessageService;
    private readonly IParticipantService _participantService;

    public EmailMessageController(IEmailMessageService emailMessageService, IParticipantService participantService)
    {
        _emailMessageService = emailMessageService;
        _participantService = participantService;
    }

    [HttpPost("{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser, RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> Post(Guid disputeGuid, [FromBody]EmailMessageRequest emailMessage)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (!emailMessage.SendMethod.HasValue)
        {
            return BadRequest(ApiReturnMessages.SendMethodIsRequired);
        }

        switch (emailMessage.SendMethod)
        {
            case EmailSendMethod.Custom:
                if (emailMessage.EmailTo.IsValidEmail() == false && emailMessage.MessageType < (byte)EmailMessageType.Pickup)
                {
                    return BadRequest(ApiReturnMessages.InvalidEmailTo);
                }

                break;
            case EmailSendMethod.Participant:
                var participantEmail = await _participantService.GetParticipantEmail(disputeGuid, emailMessage.ParticipantId);

                switch (participantEmail.Result)
                {
                    case ParticipantEmailErrorCodes.EmailFound:
                        emailMessage.EmailTo = participantEmail.Value;

                        break;
                    case ParticipantEmailErrorCodes.ProvidedParticipantDoesNotHaveEmail:
                        if (emailMessage.MessageType < (byte)EmailMessageType.Pickup)
                        {
                            return BadRequest(string.Format(ApiReturnMessages.ParticipantEmailDoesNotExist, emailMessage.ParticipantId));
                        }

                        break;

                    case ParticipantEmailErrorCodes.ProvidedParticipantIsNotAssociatedToDispute:
                        return BadRequest(string.Format(ApiReturnMessages.ParticipantEmailIsNotAssociatedToDispute, emailMessage.ParticipantId));

                    case ParticipantEmailErrorCodes.ParticipantNotFound:
                        return BadRequest(string.Format(ApiReturnMessages.ParticipantDoesNotExist, emailMessage.ParticipantId));

                    default:
                        throw new ArgumentOutOfRangeException();
                }

                break;
            default:
                throw new ArgumentOutOfRangeException();
        }

        if (emailMessage.RelatedMessageId.HasValue)
        {
            var relatedMessage = await _emailMessageService.GetByIdAsync(emailMessage.RelatedMessageId.Value);
            if (relatedMessage == null || relatedMessage.DisputeGuid != disputeGuid)
            {
                return BadRequest(ApiReturnMessages.InvalidRelatedMessage);
            }
        }

        var decodedBody = WebUtility.HtmlDecode(emailMessage.HtmlBody);
        emailMessage.HtmlBody = decodedBody;

        DisputeSetContext(disputeGuid);
        var newEmail = await _emailMessageService.CreateAsync(disputeGuid, emailMessage);
        EntityIdSetContext(newEmail.EmailMessageId);
        return Ok(newEmail);
    }

    [HttpDelete("{emailId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Delete(int emailId)
    {
        if (CheckModified(_emailMessageService, emailId))
        {
            return StatusConflicted();
        }

        var ifEmailSent = await _emailMessageService.IsMessageSentAsync(emailId);
        if (ifEmailSent)
        {
            return BadRequest(ApiReturnMessages.EmailAlreadySent);
        }

        await DisputeResolveAndSetContext(_emailMessageService, emailId);
        var result = await _emailMessageService.DeleteAsync(emailId);
        if (result)
        {
            EntityIdSetContext(emailId);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }

    [HttpPatch("{emailId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Patch(int emailId, [FromBody]JsonPatchDocumentExtension<EmailMessageRequestPatch> emailMessage)
    {
        if (CheckModified(_emailMessageService, emailId))
        {
            return StatusConflicted();
        }

        var emailMessageToPatch = await _emailMessageService.GetForPatchAsync(emailId);
        if (emailMessageToPatch != null)
        {
            var participantId = emailMessage.GetValue<int>("/participant_id");
            if (participantId.Exists && emailMessageToPatch.ParticipantId != null)
            {
                return BadRequest(ApiReturnMessages.ParticipantIdIsSetted);
            }

            var relatedMessageId = emailMessage.GetValue<int?>("/related_message_id");
            if (relatedMessageId.Exists)
            {
                var relatedMessage = await _emailMessageService.GetByIdAsync(relatedMessageId.Value.GetValueOrDefault());
                if (relatedMessage == null || relatedMessage.DisputeGuid != emailMessageToPatch.DisputeGuid)
                {
                    return BadRequest(ApiReturnMessages.InvalidRelatedMessage);
                }
            }

            var triggerEmail = false;
            var isActive = emailMessage.GetValue<bool>("/is_active");
            if (isActive.Exists && isActive.Value)
            {
                triggerEmail = true;
            }

            var htmlBody = emailMessage.GetValue<string>("/html_body");
            if (htmlBody.Exists)
            {
                var decodedBody = WebUtility.HtmlDecode(htmlBody.Value);
                emailMessageToPatch.HtmlBody = decodedBody;
            }

            emailMessage.ApplyTo(emailMessageToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await DisputeResolveAndSetContext(_emailMessageService, emailId);
            var result = await _emailMessageService.PatchAsync(emailId, emailMessageToPatch, triggerEmail);

            if (result != null)
            {
                EntityIdSetContext(emailId);
                return Ok(result);
            }
        }

        return NotFound();
    }

    [HttpGet("{emailId:int}")]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> GetById(int emailId)
    {
        var emailMessage = await _emailMessageService.GetByIdAsync(emailId);
        if (emailMessage != null)
        {
            return Ok(emailMessage);
        }

        return NotFound();
    }

    [HttpGet("/api/disputeemailmessages/{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser })]
    public async Task<IActionResult> GetByDisputeGuid(Guid disputeGuid, int count, int index)
    {
        var emailMessages = await _emailMessageService.GetByDisputeGuidAsync(disputeGuid, count, index);
        return Ok(emailMessages);
    }
}