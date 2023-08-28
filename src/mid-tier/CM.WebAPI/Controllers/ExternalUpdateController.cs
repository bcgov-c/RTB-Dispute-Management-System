using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.ExternalUpdate;
using CM.Business.Services.DisputeServices;
using CM.Business.Services.Files;
using CM.Business.Services.Hearings;
using CM.Business.Services.Notice;
using CM.Business.Services.NoticeService;
using CM.Business.Services.Parties;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Route("api/externalupdate")]
[Produces(Application.Json)]
public class ExternalUpdateController : BaseController
{
    private readonly IDisputeService _disputeService;
    private readonly IMapper _mapper;
    private readonly INoticeServiceService _noticeServiceService;
    private readonly IParticipantService _participantService;
    private readonly IHearingService _hearingService;
    private readonly IFileDescriptionService _fileDescriptionService;
    private readonly INoticeService _noticeService;

    public ExternalUpdateController(IParticipantService participantService, INoticeServiceService noticeServiceService, IDisputeService disputeService, IHearingService hearingService, IFileDescriptionService fileDescriptionService, INoticeService noticeService, IMapper mapper)
    {
        _participantService = participantService;
        _noticeServiceService = noticeServiceService;
        _disputeService = disputeService;
        _hearingService = hearingService;
        _mapper = mapper;
        _fileDescriptionService = fileDescriptionService;
        _noticeService = noticeService;
    }

    [HttpPatch("participant/{participantId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> PatchParticipant(int participantId, [FromBody]JsonPatchDocumentExtension<ExternalUpdateParticipantRequest> participant)
    {
        if (CheckModified(_participantService, participantId))
        {
            return StatusConflicted();
        }

        var originalParty = await _participantService.GetByIdAsync(participantId);
        if (originalParty != null)
        {
            var participantToPatch = _mapper.Map<Participant, ExternalUpdateParticipantRequest>(originalParty);
            participant.ApplyTo(participantToPatch);

            await TryUpdateModelAsync(participantToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _mapper.Map(participantToPatch, originalParty);
            originalParty.ParticipantId = participantId;

            await DisputeResolveAndSetContext(_participantService, participantId);
            var result = await _participantService.PatchAsync(originalParty);
            EntityIdSetContext(participantId);
            return Ok(_mapper.Map<Participant, ExternalUpdateParticipantResponse>(result));
        }

        return NotFound();
    }

    [HttpPatch("noticeservice/{noticeServiceId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.ExtendedAccessCode })]
    public async Task<IActionResult> PatchNoticeService(int noticeServiceId, [FromBody]JsonPatchDocumentExtension<ExternalUpdateNoticeServiceRequest> noticeService)
    {
        if (CheckModified(_noticeServiceService, noticeServiceId))
        {
            return StatusConflicted();
        }

        var originalNoticeService = await _noticeServiceService.GetNoticeServiceAsync(noticeServiceId);
        if (originalNoticeService != null)
        {
            var noticeServiceToPatch = _mapper.Map<Data.Model.NoticeService, ExternalUpdateNoticeServiceRequest>(originalNoticeService);
            noticeService.ApplyTo(noticeServiceToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var servedParticipantId = noticeService.GetValue<int>("/served_by");
            if (servedParticipantId.Exists && !await _participantService.ParticipantExists(servedParticipantId.Value))
            {
                return BadRequest(string.Format(ApiReturnMessages.ParticipantDoesNotExist, servedParticipantId.Value));
            }

            var proofFileDescriptionId = noticeService.GetValue<int?>("/proof_file_description_id");
            if (proofFileDescriptionId.Exists && proofFileDescriptionId.Value.HasValue)
            {
                var fileDescription = await _fileDescriptionService.GetAsync(proofFileDescriptionId.Value.Value);
                var notice = await _noticeService.GetNoTrackingNoticeAsync(originalNoticeService.NoticeId);
                if (fileDescription.DisputeGuid != notice.DisputeGuid)
                {
                    return BadRequest(string.Format(ApiReturnMessages.FileDescriptionInvalid, proofFileDescriptionId.Value, notice.DisputeGuid));
                }
            }

            var otherProofFileDescriptionId = noticeService.GetValue<int?>("/other_proof_file_description_id");
            if (otherProofFileDescriptionId.Exists && otherProofFileDescriptionId.Value.HasValue)
            {
                var fileDescription = await _fileDescriptionService.GetAsync(otherProofFileDescriptionId.Value.Value);
                var notice = await _noticeService.GetNoTrackingNoticeAsync(originalNoticeService.NoticeId);
                if (fileDescription.DisputeGuid != notice.DisputeGuid)
                {
                    return BadRequest(string.Format(ApiReturnMessages.FileDescriptionInvalid, otherProofFileDescriptionId.Value, notice.DisputeGuid));
                }
            }

            var useCase = GetServiceAuditLogUseCase(originalNoticeService, noticeServiceToPatch);

            _mapper.Map(noticeServiceToPatch, originalNoticeService);
            originalNoticeService.NoticeServiceId = noticeServiceId;

            await DisputeResolveAndSetContext(_noticeServiceService, noticeServiceId);
            var result = await _noticeServiceService.PatchAsync(originalNoticeService, useCase);

            if (result != null)
            {
                EntityIdSetContext(noticeServiceId);
                return Ok(_mapper.Map<Data.Model.NoticeService, ExternalsUpdateNoticeServiceResponse>(result));
            }
        }

        return NotFound();
    }

    [HttpPost("disputestatus/{fileNumber:int}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> PostDisputeStatus(int fileNumber, [FromBody]ExternalUpdateDisputeStatusRequest disputeStatus)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = GetLoggedInUserId();
        var dispute = await _disputeService.GetDisputeByFileNumber(fileNumber);
        if (dispute != null)
        {
            var lastDisputeStatus = await _disputeService.GetDisputeLastStatusAsync(dispute.DisputeGuid);
            if (lastDisputeStatus != null)
            {
                if (_disputeService.StatusChangeAllowed(disputeStatus, lastDisputeStatus))
                {
                    DisputeSetContext(dispute.DisputeGuid);
                    var result = await _disputeService.PostDisputeStatusAsync(disputeStatus, lastDisputeStatus.DisputeGuid, userId);
                    EntityIdSetContext(result.DisputeStatusId);
                    return Ok(result);
                }

                return BadRequest(ApiReturnMessages.CurrentStatusCannotBeModified);
            }
        }

        return NotFound();
    }

    [HttpGet("hearingwaittime")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.User, RoleNames.AccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> GetHearingWaitTime(ExternalHearingWaitTimeRequest request)
    {
        var time = await _hearingService.GetHearingWaitTime(request);
        if (time != null)
        {
            return Ok(time);
        }

        return NotFound();
    }

    private ServiceChangeType? GetServiceAuditLogUseCase(CM.Data.Model.NoticeService originalNoticeService, ExternalUpdateNoticeServiceRequest noticeServiceToPatch)
    {
        if (originalNoticeService.ServiceMethod != noticeServiceToPatch.ServiceMethod ||
            originalNoticeService.ServiceDate != noticeServiceToPatch.ServiceDate ||
            originalNoticeService.ServedBy != noticeServiceToPatch.ServedBy)
        {
            return ServiceChangeType.EditServiceInformation;
        }

        if (
            (originalNoticeService.ValidationStatus == 0 ||
            originalNoticeService.ValidationStatus == null ||
            originalNoticeService.ValidationStatus == 3 ||
            originalNoticeService.ValidationStatus == 4)
            &&
            (noticeServiceToPatch.ValidationStatus == 1 ||
            noticeServiceToPatch.ValidationStatus == 2)
            )
        {
            return ServiceChangeType.ConfirmRecord;
        }

        if (
            (originalNoticeService.ValidationStatus == 0 ||
            originalNoticeService.ValidationStatus == null ||
            originalNoticeService.ValidationStatus == 1 ||
            originalNoticeService.ValidationStatus == 2)
            &&
            (noticeServiceToPatch.ValidationStatus == 3 ||
            noticeServiceToPatch.ValidationStatus == 4)
            )
        {
            return ServiceChangeType.InvalidateRecord;
        }

        return null;
    }
}