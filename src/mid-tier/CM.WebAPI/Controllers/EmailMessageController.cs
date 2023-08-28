using System;
using System.Net;
using System.Threading.Tasks;
using CM.Business.Entities.Models.EmailMessage;
using CM.Business.Services.DisputeServices;
using CM.Business.Services.EmailMessages;
using CM.Business.Services.Parties;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/emailmessage")]
public class EmailMessageController : BaseController
{
    private readonly IEmailMessageService _emailMessageService;
    private readonly IParticipantService _participantService;
    private readonly IDisputeService _disputeService;

    public EmailMessageController(
        IEmailMessageService emailMessageService,
        IParticipantService participantService,
        IDisputeService disputeService)
    {
        _emailMessageService = emailMessageService;
        _participantService = participantService;
        _disputeService = disputeService;
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

    [HttpPost("/api/emailverificationmessage/{participantId:int}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser, RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> PostVerificationMessage(int participantId)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var headerGuid = HttpContext.Request.Headers["disputeGuid"].ToString();
        var disputeGuid = Guid.Empty;
        var isValid = Guid.TryParse(headerGuid, out disputeGuid);

        if (string.IsNullOrEmpty(headerGuid) || !isValid)
        {
            return BadRequest(ApiReturnMessages.DisputeGuidRequired);
        }

        var disputeExists = await _disputeService.DisputeExistsAsync(disputeGuid);
        if (!disputeExists)
        {
            return BadRequest(ApiReturnMessages.DisputeDoesNotExist);
        }

        var participant = await _participantService.GetByIdAsync(participantId);
        if (participant == null || participant.ParticipantStatus == (byte)ParticipantStatus.Removed ||
                                    participant.ParticipantStatus == (byte)ParticipantStatus.Deleted)
        {
            return BadRequest(ApiReturnMessages.InvalidParticipant);
        }

        if (disputeGuid != participant.DisputeGuid)
        {
            return BadRequest(string.Format(ApiReturnMessages.InvalidParticipantOnDispute, participantId));
        }

        if (string.IsNullOrEmpty(participant.Email))
        {
            return BadRequest(ApiReturnMessages.ParticipantEmailDoesNotExist);
        }

        if (participant.EmailVerified == true)
        {
            return BadRequest(ApiReturnMessages.ParticipantEmailAlreadyVerified);
        }

        var result = await _emailMessageService.CreateAsync(participant);
        if (!result)
        {
            return BadRequest(ApiReturnMessages.EmailSentFailed);
        }
        else
        {
            return Ok(ApiReturnMessages.EmailSent);
        }
    }

    [HttpPost("/api/contactverification/{participantId:int}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser, RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> PostEmailVerification(int participantId, EmailVerificationRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var headerGuid = HttpContext.Request.Headers["disputeGuid"].ToString();
        var disputeGuid = Guid.Empty;
        var isValid = Guid.TryParse(headerGuid, out disputeGuid);

        if (string.IsNullOrEmpty(headerGuid) || !isValid)
        {
            return BadRequest(ApiReturnMessages.DisputeGuidRequired);
        }

        var disputeExists = await _disputeService.DisputeExistsAsync(disputeGuid);
        if (!disputeExists)
        {
            return BadRequest(ApiReturnMessages.DisputeDoesNotExist);
        }

        var participant = await _participantService.GetByIdAsync(participantId);
        if (participant == null || participant.ParticipantStatus == (byte)ParticipantStatus.Removed ||
                                    participant.ParticipantStatus == (byte)ParticipantStatus.Deleted)
        {
            return BadRequest(ApiReturnMessages.InvalidParticipant);
        }

        if (disputeGuid != participant.DisputeGuid)
        {
            return BadRequest(string.Format(ApiReturnMessages.InvalidParticipantOnDispute, participantId));
        }

        if (request.VerificationType == VerificationType.Email)
        {
            if (string.IsNullOrEmpty(participant.Email))
            {
                return BadRequest(ApiReturnMessages.ParticipantEmailDoesNotExist);
            }

            if (participant.EmailVerified == true)
            {
                return BadRequest(ApiReturnMessages.ParticipantEmailAlreadyVerified);
            }

            if (participant.EmailVerifyCode != request.VerificationCode)
            {
                participant.EmailVerifyCode = StringHelper.GetRandomCode();
                await _participantService.PatchAsync(participant);
                return BadRequest(ApiReturnMessages.InvalidVerificationCode);
            }
        }

        if (request.VerificationType == VerificationType.PrimaryPhone)
        {
            if (string.IsNullOrEmpty(participant.PrimaryPhone))
            {
                return BadRequest(ApiReturnMessages.ParticipantPrimaryPhoneDoesNotExist);
            }

            if (participant.PrimaryPhoneVerified == true)
            {
                return BadRequest(ApiReturnMessages.ParticipantPrimaryPhoneAlreadyVerified);
            }

            if (participant.PrimaryPhoneVerifyCode != request.VerificationCode)
            {
                participant.PrimaryPhoneVerifyCode = StringHelper.GetRandomCode();
                await _participantService.PatchAsync(participant);
                return BadRequest(ApiReturnMessages.InvalidVerificationCode);
            }
        }

        if (request.VerificationType == VerificationType.SecondaryPhone)
        {
            if (string.IsNullOrEmpty(participant.SecondaryPhone))
            {
                return BadRequest(ApiReturnMessages.ParticipantSecondaryPhoneDoesNotExist);
            }

            if (participant.SecondaryPhoneVerified == true)
            {
                return BadRequest(ApiReturnMessages.ParticipantSecondaryPhoneAlreadyVerified);
            }

            if (participant.SecondaryPhoneVerifyCode != request.VerificationCode)
            {
                participant.SecondaryPhoneVerifyCode = StringHelper.GetRandomCode();
                await _participantService.PatchAsync(participant);
                return BadRequest(ApiReturnMessages.InvalidVerificationCode);
            }
        }

        var result = await _emailMessageService.VerifyCode(participant, request);
        if (!result)
        {
            return BadRequest(ApiReturnMessages.EmailSentFailed);
        }
        else
        {
            return Ok(ApiReturnMessages.EmailSent);
        }
    }

    [HttpGet("/api/externaldisputeemailmessages/{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser, RoleNames.OfficePay })]
    public async Task<IActionResult> GetExternalDisputeEmailMessages(Guid disputeGuid, ExternalEmailMessagesRequest request, int count, int index)
    {
        var emailMessages = await _emailMessageService.GetExternalDisputeEmailMessages(disputeGuid, request, count, index);
        return Ok(emailMessages);
    }
}