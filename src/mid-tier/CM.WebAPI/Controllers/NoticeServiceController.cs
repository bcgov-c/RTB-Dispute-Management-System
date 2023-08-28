using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.NoticeService;
using CM.Business.Services.Files;
using CM.Business.Services.Notice;
using CM.Business.Services.NoticeService;
using CM.Business.Services.Parties;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;
using NoticeService = CM.Data.Model.NoticeService;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/noticeservice")]
public class NoticeServiceController : BaseController
{
    private readonly IFileDescriptionService _fileDescriptionService;
    private readonly IMapper _mapper;
    private readonly INoticeService _noticeService;
    private readonly INoticeServiceService _noticeServiceService;
    private readonly IParticipantService _participantService;

    public NoticeServiceController(INoticeServiceService noticeServiceService, INoticeService noticeService, IParticipantService participantService, IMapper mapper, IFileDescriptionService fileDescriptionService)
    {
        _noticeServiceService = noticeServiceService;
        _noticeService = noticeService;
        _participantService = participantService;
        _fileDescriptionService = fileDescriptionService;
        _mapper = mapper;
    }

    [HttpPost("{noticeId:int}")]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Post(int noticeId, [FromBody]NoticeServiceRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var noticeExists = await _noticeService.NoticeExists(noticeId);
        if (!noticeExists)
        {
            return BadRequest(string.Format(ApiReturnMessages.NoticeDoesNotExist, noticeId));
        }

        if (request.ServedBy != null)
        {
            if (request.ParticipantId == request.ServedBy)
            {
                return BadRequest(ApiReturnMessages.SameParticipantNotAllowed);
            }

            var servedParticipantExists = await _participantService.ParticipantExists(request.ServedBy);
            if (!servedParticipantExists)
            {
                return BadRequest(string.Format(ApiReturnMessages.ParticipantDoesNotExist, request.ServedBy));
            }
        }

        var regularParticipantExists = await _participantService.ParticipantExists(request.ParticipantId);
        if (!regularParticipantExists)
        {
            return BadRequest(string.Format(ApiReturnMessages.ParticipantDoesNotExist, request.ParticipantId));
        }

        var notice = await _noticeService.GetNoTrackingNoticeAsync(noticeId);
        if (request.ProofFileDescriptionId.HasValue)
        {
            var proofFileDescriptionExists = await _fileDescriptionService
                .FileDescriptionExists(notice.DisputeGuid, request.ProofFileDescriptionId.Value);
            if (!proofFileDescriptionExists)
            {
                return BadRequest(string.Format(ApiReturnMessages.ProofFileDescriptionInvalid, request.ProofFileDescriptionId, notice.DisputeGuid));
            }
        }

        if (request.OtherProofFileDescriptionId.HasValue)
        {
            var otherProofFileDescriptionExists = await _fileDescriptionService
                .FileDescriptionExists(notice.DisputeGuid, request.OtherProofFileDescriptionId.Value);
            if (!otherProofFileDescriptionExists)
            {
                return BadRequest(string.Format(ApiReturnMessages.OtherProofFileDescriptionInvalid, request.OtherProofFileDescriptionId, notice.DisputeGuid));
            }
        }

        await DisputeResolveAndSetContext(_noticeService, noticeId);
        var newNoticeService = await _noticeServiceService.CreateAsync(noticeId, request);
        EntityIdSetContext(newNoticeService.NoticeServiceId);
        return Ok(newNoticeService);
    }

    [HttpDelete("{noticeServiceId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Delete(int noticeServiceId)
    {
        if (CheckModified(_noticeServiceService, noticeServiceId))
        {
            return StatusConflicted();
        }

        await DisputeResolveAndSetContext(_noticeServiceService, noticeServiceId);
        var result = await _noticeServiceService.DeleteAsync(noticeServiceId);
        if (result)
        {
            EntityIdSetContext(noticeServiceId);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }

    [HttpPatch("{noticeServiceId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Patch(int noticeServiceId, [FromBody]JsonPatchDocumentExtension<NoticeServicePatchRequest> noticeService)
    {
        if (CheckModified(_noticeServiceService, noticeServiceId))
        {
            return StatusConflicted();
        }

        var originalNoticeService = await _noticeServiceService.GetNoticeServiceAsync(noticeServiceId);
        if (originalNoticeService != null)
        {
            var noticeServiceToPatch = _mapper.Map<NoticeService, NoticeServicePatchRequest>(originalNoticeService);
            noticeService.ApplyTo(noticeServiceToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var participantId = noticeService.GetValue<int>("/participant_id");
            if (participantId.Exists && !await _participantService.ParticipantExists(participantId.Value))
            {
                return BadRequest(string.Format(ApiReturnMessages.ParticipantDoesNotExist, participantId.Value));
            }

            var servedParticipantId = noticeService.GetValue<int?>("/served_by");
            if (servedParticipantId.Exists && servedParticipantId.Value != null && !await _participantService.ParticipantExists(servedParticipantId.Value))
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

            var useCase = _noticeServiceService.GetServiceAuditLogUseCase(originalNoticeService, noticeServiceToPatch);

            await DisputeResolveAndSetContext(_noticeServiceService, noticeServiceId);
            _mapper.Map(noticeServiceToPatch, originalNoticeService);
            var result = await _noticeServiceService.PatchAsync(originalNoticeService, useCase);

            if (result != null)
            {
                EntityIdSetContext(noticeServiceId);
                return Ok(_mapper.Map<NoticeService, NoticeServiceResponse>(result));
            }
        }

        return NotFound();
    }
}