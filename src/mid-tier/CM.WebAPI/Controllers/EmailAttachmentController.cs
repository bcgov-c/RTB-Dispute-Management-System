using System.Threading.Tasks;
using CM.Business.Entities.Models.EmailAttachment;
using CM.Business.Services.EmailAttachment;
using CM.Business.Services.EmailMessages;
using CM.Business.Services.Files;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/emailattachment")]
public class EmailAttachmentController : BaseController
{
    private readonly ICommonFileService _commonFileService;
    private readonly IEmailAttachmentService _emailAttachmentService;
    private readonly IEmailMessageService _emailMessageService;
    private readonly IFileService _fileService;

    public EmailAttachmentController(IEmailAttachmentService emailAttachmentService, IEmailMessageService emailMessageService, IFileService fileService, ICommonFileService commonFileService)
    {
        _emailAttachmentService = emailAttachmentService;
        _emailMessageService = emailMessageService;
        _fileService = fileService;
        _commonFileService = commonFileService;
    }

    [HttpPost("{emailId:int}")]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Post(int emailId, [FromBody]EmailAttachmentRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var emailMessageExists = await _emailMessageService.EmailMessageExists(emailId);
        if (!emailMessageExists)
        {
            return BadRequest(string.Format(ApiReturnMessages.EmailMessageDoesNotExist, emailId));
        }

        switch (request.AttachmentType)
        {
            case AttachmentType.Common:
                if (request.CommonFileId == null)
                {
                    return BadRequest(ApiReturnMessages.CommonFileIdIsRequired);
                }

                var commonFileExists = await _commonFileService.FileExists(request.CommonFileId.Value);
                if (!commonFileExists)
                {
                    return BadRequest(string.Format(ApiReturnMessages.CommonFileDoesNotExist, request.CommonFileId));
                }

                break;
            case AttachmentType.Dispute:
                if (request.FileId == null)
                {
                    return BadRequest(ApiReturnMessages.FileIdIsRequired);
                }

                var fileExists = await _fileService.FileExists(request.FileId.Value);
                if (!fileExists)
                {
                    return BadRequest(string.Format(ApiReturnMessages.FileDoesNotExist, request.FileId));
                }

                break;
            default:
                return BadRequest(ApiReturnMessages.UnknownAttachmentType);
        }

        await DisputeResolveAndSetContext(_emailMessageService, emailId);
        var newEmailAttachment = await _emailAttachmentService.CreateAsync(emailId, request);
        EntityIdSetContext(newEmailAttachment.EmailAttachmentId);
        return Ok(newEmailAttachment);
    }

    [HttpDelete("{emailAttachmentId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Delete(int emailAttachmentId)
    {
        if (CheckModified(_emailAttachmentService, emailAttachmentId))
        {
            return StatusConflicted();
        }

        var isSent = await _emailAttachmentService.IsEmailSent(emailAttachmentId);
        if (isSent)
        {
            return BadRequest(ApiReturnMessages.EmailAlreadySent);
        }

        await DisputeResolveAndSetContext(_emailAttachmentService, emailAttachmentId);
        var result = await _emailAttachmentService.DeleteAsync(emailAttachmentId);
        if (result)
        {
            EntityIdSetContext(emailAttachmentId);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }

    [HttpGet("/api/disputeemailattachments/{emailId:int}")]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> GetAll(int emailId)
    {
        var emailAttachments = await _emailAttachmentService.GetAllAsync(emailId);
        return Ok(emailAttachments);
    }
}