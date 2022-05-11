using System;
using System.Threading.Tasks;
using CM.Business.Entities.Models.Amendment;
using CM.Business.Services.Amendment;
using CM.Business.Services.Files;
using CM.Business.Services.Notice;
using CM.Business.Services.Parties;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using CM.WebAPI.WebApiHelpers;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/amendment")]
public class AmendmentController : BaseController
{
    private readonly IAmendmentService _amendmentService;
    private readonly IFileService _fileService;
    private readonly INoticeService _noticeService;
    private readonly IParticipantService _participantService;

    public AmendmentController(IAmendmentService amendmentService, IParticipantService participantService, INoticeService noticeService, IFileService fileService)
    {
        _amendmentService = amendmentService;
        _participantService = participantService;
        _noticeService = noticeService;
        _fileService = fileService;
    }

    [HttpPost("{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedAccessCode, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Post(Guid disputeGuid, [FromBody]AmendmentRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (request.NoticeId != null)
        {
            var noticeExists = await _noticeService.NoticeExists((int)request.NoticeId);
            if (!noticeExists)
            {
                return BadRequest(string.Format(ApiReturnMessages.NoticeDoesNotExist, request.NoticeId));
            }
        }

        if (request.AmendmentSubmitterId != null)
        {
            var participantExists = await _participantService.ParticipantExists((int)request.AmendmentSubmitterId);
            if (!participantExists)
            {
                return BadRequest(string.Format(ApiReturnMessages.ParticipantDoesNotExist, request.AmendmentSubmitterId));
            }
        }

        if (request.AmendmentFileId != null)
        {
            var fileExists = await _fileService.FileExists((int)request.AmendmentFileId);
            if (!fileExists)
            {
                return BadRequest(string.Format(ApiReturnMessages.FileDoesNotExist, request.AmendmentFileId));
            }
        }

        DisputeSetContext(disputeGuid);
        var newAmendment = await _amendmentService.CreateAsync(disputeGuid, request);
        EntityIdSetContext(newAmendment.AmendmentId);
        return Ok(newAmendment);
    }

    [HttpPatch("{amendmentId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Patch(int amendmentId, [FromBody] JsonPatchDocumentExtension<AmendmentRequest> amendment)
    {
        if (CheckModified(_amendmentService, amendmentId))
        {
            return StatusConflicted();
        }

        var amendmentToPatch = await _amendmentService.GetForPatchAsync(amendmentId);
        if (amendmentToPatch != null)
        {
            amendment.ApplyTo(amendmentToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var noticeId = amendment.GetValue<int?>("/notice_id");
            if (noticeId.Exists && noticeId.Value.HasValue && !await _noticeService.NoticeExists(noticeId.Value.Value))
            {
                return BadRequest(string.Format(ApiReturnMessages.NoticeDoesNotExist, noticeId.Value));
            }

            var participantId = amendment.GetValue<int?>("/amendment_submitter_id");
            if (participantId.Exists && participantId.Value.HasValue && !await _participantService.ParticipantExists(participantId.Value))
            {
                return BadRequest(string.Format(ApiReturnMessages.ParticipantDoesNotExist, participantId.Value));
            }

            var fileId = amendment.GetValue<int?>("/amendment_file_id");
            if (fileId.Exists && fileId.Value.HasValue && !await _fileService.FileExists(fileId.Value.Value))
            {
                return BadRequest(string.Format(ApiReturnMessages.FileDoesNotExist, fileId.Value));
            }

            await DisputeResolveAndSetContext(_amendmentService, amendmentId);
            var result = await _amendmentService.PatchAsync(amendmentId, amendmentToPatch);

            if (result != null)
            {
                EntityIdSetContext(amendmentId);
                return Ok(result);
            }
        }

        return NotFound();
    }

    [HttpGet("{amendmentId:int}")]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Get(int amendmentId)
    {
        var amendment = await _amendmentService.GetAsync(amendmentId);
        if (amendment != null)
        {
            return Ok(amendment);
        }

        return NotFound();
    }

    [HttpGet("/api/disputeamendments/{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser })]
    public async Task<IActionResult> GetDisputeAmendments(Guid disputeGuid)
    {
        var amendments = await _amendmentService.GetByDisputeAsync(disputeGuid);
        return Ok(amendments);
    }
}