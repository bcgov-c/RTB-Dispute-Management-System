using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Notice;
using CM.Business.Services.ConferenceBridge;
using CM.Business.Services.DisputeServices;
using CM.Business.Services.Files;
using CM.Business.Services.Hearings;
using CM.Business.Services.Notice;
using CM.Business.Services.Parties;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/notice")]
public class NoticeController : BaseController
{
    private readonly IConferenceBridgeService _conferenceBridgeService;
    private readonly IDisputeService _disputeService;
    private readonly IFileDescriptionService _fileDescriptionService;
    private readonly IHearingService _hearingService;
    private readonly IMapper _mapper;
    private readonly INoticeService _noticeService;
    private readonly IParticipantService _participantService;

    public NoticeController(INoticeService noticeService, IParticipantService participantService, IHearingService hearingService, IDisputeService disputeService, IMapper mapper, IConferenceBridgeService conferenceBridgeService, IFileDescriptionService fileDescriptionService)
    {
        _noticeService = noticeService;
        _participantService = participantService;
        _hearingService = hearingService;
        _disputeService = disputeService;
        _mapper = mapper;
        _conferenceBridgeService = conferenceBridgeService;
        _fileDescriptionService = fileDescriptionService;
    }

    [HttpPost("{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> Post(Guid disputeGuid, [FromBody]NoticePostRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var disputeExists = await _disputeService.DisputeExistsAsync(disputeGuid);
        if (!disputeExists)
        {
            return BadRequest(string.Format(ApiReturnMessages.DisputeDoesNotExist, disputeGuid));
        }

        if (request.ParentNoticeId != null)
        {
            var isParentNoticeValid = await _noticeService.GetParentNotice(request.ParentNoticeId.Value, disputeGuid);
            if (!isParentNoticeValid)
            {
                return BadRequest(ApiReturnMessages.InvalidParentNotice);
            }
        }

        if (request.HearingId.HasValue)
        {
            var hearingExists = await _hearingService.HearingExists(request.HearingId.Value);
            if (!hearingExists)
            {
                return BadRequest(string.Format(ApiReturnMessages.HearingDoesNotExist, request.HearingId));
            }
        }

        if (request.ConferenceBridgeId.HasValue)
        {
            var conferenceBridgeExists = await _conferenceBridgeService.ConferenceBridgeExists(request.ConferenceBridgeId.Value);
            if (!conferenceBridgeExists)
            {
                return BadRequest(string.Format(ApiReturnMessages.ConferenceBridgeDoesNotExist, request.ConferenceBridgeId));
            }
        }

        if (request.NoticeDeliveredTo != null)
        {
            var participantExists = await _noticeService.IfDisputeParticipantExists(request.NoticeDeliveredTo, disputeGuid);
            if (!participantExists)
            {
                return BadRequest(string.Format(ApiReturnMessages.ParticipantWithDisputeDoesNotExist, request.NoticeDeliveredTo, disputeGuid));
            }
        }

        if (request.NoticeFileDescriptionId != null)
        {
            var fileDescription = await _fileDescriptionService.GetAsync(request.NoticeFileDescriptionId.Value);
            if (fileDescription.DisputeGuid != disputeGuid)
            {
                return BadRequest(string.Format(ApiReturnMessages.FileDescriptionInvalid, request.NoticeFileDescriptionId.Value, disputeGuid));
            }
        }

        if (request.HasServiceDeadline.HasValue && request.HasServiceDeadline.Value &&
            (!request.ServiceDeadlineDays.HasValue && !request.ServiceDeadlineDate.HasValue))
        {
            return BadRequest(ApiReturnMessages.DeliveryDeadlineIssue);
        }

        if (request.SecondServiceDeadlineDate.HasValue && request.SecondServiceDeadlineDate <= DateTime.UtcNow)
        {
            return BadRequest(ApiReturnMessages.SecondServiceDeadlineDateIssue);
        }

        DisputeSetContext(disputeGuid);
        var newNotice = await _noticeService.CreateAsync(disputeGuid, request);
        EntityIdSetContext(newNotice.NoticeId);

        return Ok(newNotice);
    }

    [HttpPatch("{noticeId:int}")]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Patch(int noticeId, [FromBody]JsonPatchDocumentExtension<NoticePatchRequest> notice)
    {
        if (CheckModified(_noticeService, noticeId))
        {
            return StatusConflicted();
        }

        var originalNotice = await _noticeService.GetNoTrackingNoticeAsync(noticeId);
        if (originalNotice != null)
        {
            var noticeToPatch = _mapper.Map<Notice, NoticePatchRequest>(originalNotice);
            notice.ApplyTo(noticeToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var parentNoticeId = notice.GetValue<int?>("/parent_notice_id");
            if (parentNoticeId.Exists && parentNoticeId.Value != null)
            {
                if (!await _noticeService.GetParentNotice(parentNoticeId.Value.Value, originalNotice.DisputeGuid))
                {
                    return BadRequest(ApiReturnMessages.InvalidParentNotice);
                }

                if (parentNoticeId.Value == noticeId)
                {
                    return BadRequest(ApiReturnMessages.InvalidParentNoticeHierarchy);
                }
            }

            var participantId = notice.GetValue<int?>("/notice_delivered_to");
            if (participantId.Exists && participantId.Value != null && !await _participantService.ParticipantExists(participantId.Value))
            {
                return BadRequest(string.Format(ApiReturnMessages.ParticipantDoesNotExist, participantId.Value));
            }

            var hearingId = notice.GetValue<int?>("/hearing_id");
            if (hearingId.Exists && hearingId.Value != null && !await _hearingService.HearingExists(hearingId.Value.Value))
            {
                return BadRequest(string.Format(ApiReturnMessages.HearingDoesNotExist, hearingId.Value.Value));
            }

            var noticeFileDescriptionId = notice.GetValue<int?>("/notice_file_description_id");
            if (noticeFileDescriptionId.Exists && noticeFileDescriptionId.Value != null)
            {
                var fileDescription = await _fileDescriptionService.GetAsync(noticeFileDescriptionId.Value.Value);
                if (fileDescription.DisputeGuid != originalNotice.DisputeGuid)
                {
                    return BadRequest(string.Format(ApiReturnMessages.FileDescriptionInvalid, noticeFileDescriptionId.Value.Value, originalNotice.DisputeGuid));
                }
            }

            var hasServiceDeadline = notice.GetValue<bool?>("/has_service_deadline");
            if (hasServiceDeadline.Exists && hasServiceDeadline.Value.Value)
            {
                var serviceDeadlineDays = notice.GetValue<int?>("/service_deadline_days");
                var serviceDeadlineDate = notice.GetValue<DateTime?>("/service_deadline_date");
                if (((!serviceDeadlineDays.Exists || !serviceDeadlineDays.Value.HasValue) && !originalNotice.ServiceDeadlineDays.HasValue) &&
                    ((!serviceDeadlineDate.Exists || !serviceDeadlineDate.Value.HasValue) && !originalNotice.ServiceDeadlineDate.HasValue))
                {
                    return BadRequest(ApiReturnMessages.DeliveryDeadlineIssue);
                }
            }

            var secondServiceDeadlineDate = notice.GetValue<DateTime?>("/second_service_deadline_date");
            if (secondServiceDeadlineDate.Exists && secondServiceDeadlineDate.Value.HasValue && secondServiceDeadlineDate.Value <= DateTime.UtcNow)
            {
                return BadRequest(ApiReturnMessages.SecondServiceDeadlineDateIssue);
            }

            await DisputeResolveAndSetContext(_noticeService, noticeId);
            _mapper.Map(noticeToPatch, originalNotice);
            var result = await _noticeService.PatchAsync(originalNotice);

            if (result != null)
            {
                EntityIdSetContext(noticeId);
                var fullNotice = await _noticeService.GetByIdAsync(result.NoticeId);
                return Ok(fullNotice);
            }
        }

        return NotFound();
    }

    [HttpDelete("{noticeId:int}")]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Delete(int noticeId)
    {
        if (CheckModified(_noticeService, noticeId))
        {
            return StatusConflicted();
        }

        await DisputeResolveAndSetContext(_noticeService, noticeId);
        var result = await _noticeService.DeleteAsync(noticeId);
        if (result)
        {
            EntityIdSetContext(noticeId);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }

    [HttpGet("{noticeId:int}")]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> GetById(int noticeId)
    {
        var notice = await _noticeService.GetByIdAsync(noticeId);
        if (notice != null)
        {
            return Ok(notice);
        }

        return NotFound();
    }

    [HttpGet("/api/disputenotices/{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser })]
    public async Task<IActionResult> GetByDisputeGuid(Guid disputeGuid)
    {
        var notices = await _noticeService.GetByDisputeGuidAsync(disputeGuid);
        if (notices != null)
        {
            return Ok(notices);
        }

        return NotFound();
    }

    [HttpGet("/api/externaldisputenotices/{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser, RoleNames.OfficePay })]
    public async Task<IActionResult> GetExternalDisputeNotices(Guid disputeGuid)
    {
        var disputeExists = await _disputeService.DisputeExistsAsync(disputeGuid);
        if (!disputeExists)
        {
            return BadRequest(ApiReturnMessages.InvalidDisputeGuid);
        }

        var notices = await _noticeService.GetExternalDisputeNotices(disputeGuid);
        if (notices != null)
        {
            return Ok(notices);
        }

        return NotFound();
    }
}