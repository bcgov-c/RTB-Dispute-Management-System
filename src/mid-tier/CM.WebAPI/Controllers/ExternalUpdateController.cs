using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.ExternalUpdate;
using CM.Business.Services.DisputeServices;
using CM.Business.Services.Files;
using CM.Business.Services.NoticeService;
using CM.Business.Services.Parties;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.WebAPI.Filters;
using CM.WebAPI.WebApiHelpers;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Route("api/externalupdate")]
[Produces(Application.Json)]
public class ExternalUpdateController : BaseController
{
    private readonly IDisputeService _disputeService;
    private readonly IFileService _fileService;
    private readonly IMapper _mapper;
    private readonly INoticeServiceService _noticeServiceService;
    private readonly IParticipantService _participantService;

    public ExternalUpdateController(IParticipantService participantService, INoticeServiceService noticeServiceService, IFileService fileService, IDisputeService disputeService, IMapper mapper)
    {
        _participantService = participantService;
        _noticeServiceService = noticeServiceService;
        _fileService = fileService;
        _disputeService = disputeService;
        _mapper = mapper;
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
            var noticeServiceToPatch = _mapper.Map<NoticeService, ExternalUpdateNoticeServiceRequest>(originalNoticeService);
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

            var file1Id = noticeService.GetValue<int>("/notice_service_file_1id");
            if (file1Id.Exists && !await _fileService.FileExists(file1Id.Value))
            {
                return BadRequest(string.Format(ApiReturnMessages.FileDoesNotExist, file1Id.Value));
            }

            var file2Id = noticeService.GetValue<int>("/notice_service_file_2id");
            if (file2Id.Exists && !await _fileService.FileExists(file2Id.Value))
            {
                return BadRequest(string.Format(ApiReturnMessages.FileDoesNotExist, file2Id.Value));
            }

            var file3Id = noticeService.GetValue<int>("/notice_service_file_3id");
            if (file3Id.Exists && !await _fileService.FileExists(file3Id.Value))
            {
                return BadRequest(string.Format(ApiReturnMessages.FileDoesNotExist, file3Id.Value));
            }

            var file4Id = noticeService.GetValue<int>("/notice_service_file_4id");
            if (file4Id.Exists && !await _fileService.FileExists(file4Id.Value))
            {
                return BadRequest(string.Format(ApiReturnMessages.FileDoesNotExist, file4Id.Value));
            }

            var file5Id = noticeService.GetValue<int>("/notice_service_file_5id");
            if (file5Id.Exists && !await _fileService.FileExists(file5Id.Value))
            {
                return BadRequest(string.Format(ApiReturnMessages.FileDoesNotExist, file5Id.Value));
            }

            _mapper.Map(noticeServiceToPatch, originalNoticeService);
            originalNoticeService.NoticeServiceId = noticeServiceId;

            await DisputeResolveAndSetContext(_noticeServiceService, noticeServiceId);
            var result = await _noticeServiceService.PatchAsync(originalNoticeService);

            if (result != null)
            {
                EntityIdSetContext(noticeServiceId);
                return Ok(_mapper.Map<NoticeService, ExternalsUpdateNoticeServiceResponse>(result));
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
}