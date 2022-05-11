using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.NoticeService;
using CM.Business.Services.Files;
using CM.Business.Services.Notice;
using CM.Business.Services.NoticeService;
using CM.Business.Services.Parties;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using CM.WebAPI.WebApiHelpers;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;
using NoticeService = CM.Data.Model.NoticeService;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/noticeservice")]
public class NoticeServiceController : BaseController
{
    private readonly IFileDescriptionService _fileDescriptionService;
    private readonly IFileService _fileService;
    private readonly IMapper _mapper;
    private readonly INoticeService _noticeService;
    private readonly INoticeServiceService _noticeServiceService;
    private readonly IParticipantService _participantService;

    public NoticeServiceController(INoticeServiceService noticeServiceService, INoticeService noticeService, IParticipantService participantService, IFileService fileService, IMapper mapper, IFileDescriptionService fileDescriptionService)
    {
        _noticeServiceService = noticeServiceService;
        _noticeService = noticeService;
        _participantService = participantService;
        _fileService = fileService;
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
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
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

            await DisputeResolveAndSetContext(_noticeServiceService, noticeServiceId);
            _mapper.Map(noticeServiceToPatch, originalNoticeService);
            var result = await _noticeServiceService.PatchAsync(originalNoticeService);

            if (result != null)
            {
                EntityIdSetContext(noticeServiceId);
                return Ok(_mapper.Map<NoticeService, NoticeServiceResponse>(result));
            }
        }

        return NotFound();
    }
}