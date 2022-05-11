using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Dispute;
using CM.Business.Services.DisputeServices;
using CM.Business.Services.Notice;
using CM.Business.Services.Parties;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.WebAPI.Filters;
using CM.WebAPI.WebApiHelpers;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/dispute")]
public class DisputeController : BaseController
{
    private readonly IDisputeService _disputeService;
    private readonly IMapper _mapper;
    private readonly INoticeService _noticeService;
    private readonly IParticipantService _participantService;

    public DisputeController(IDisputeService disputeService, IParticipantService participantService, INoticeService noticeService, IMapper mapper)
    {
        _disputeService = disputeService;
        _participantService = participantService;
        _noticeService = noticeService;
        _mapper = mapper;
    }

    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.User })]
    [HttpPost("newdispute")]
    public async Task<IActionResult> Post()
    {
        var userId = GetLoggedInUserId();
        var newDispute = await _disputeService.CreateAsync(userId);
        return Ok(newDispute);
    }

    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.User })]
    [HttpGet("disputelist")]
    public async Task<IActionResult> GetAll(int count, int index, int? creationMethod)
    {
        var userId = GetLoggedInUserId();
        var disputeResponse = await _disputeService.GetAllAsync(count, index, userId, creationMethod);

        return Ok(disputeResponse);
    }

    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser })]
    [HttpGet("{disputeGuid:Guid}")]
    public async Task<IActionResult> Get([Required]Guid disputeGuid)
    {
        if (disputeGuid.Equals(Guid.Empty))
        {
            return BadRequest(ApiReturnMessages.DisputeGuidRequired);
        }

        var disputeResponse = await _disputeService.GetDisputeResponseAsync(disputeGuid);
        if (disputeResponse != null)
        {
            return Ok(disputeResponse);
        }

        return NotFound();
    }

    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser })]
    [HttpPatch("{disputeGuid:Guid}")]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Patch(Guid disputeGuid, [FromBody]JsonPatchDocumentExtension<DisputeRequest> request)
    {
        if (CheckModified(_disputeService, disputeGuid))
        {
            return StatusConflicted();
        }

        var originalDispute = await _disputeService.GetDisputeNoTrackAsync(disputeGuid);

        var id = originalDispute.DisputeId;

        var newDispute = _mapper.Map<Dispute, DisputeRequest>(originalDispute);
        request.ApplyTo(newDispute);
        await TryUpdateModelAsync(newDispute);

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var(exists, value) = request.GetValue<int>("/owner_system_user_id");
        if (exists && value == (int)Roles.ExternalUser)
        {
            if (!await ValidateDisputeOwner(disputeGuid, value))
            {
                return BadRequest(ApiReturnMessages.OwnerNotAssociated);
            }
        }

        var initialPaymentParticipant = request.GetValue<int>("/initial_payment_by");
        if (initialPaymentParticipant.Exists && !await _participantService.ParticipantExists(initialPaymentParticipant.Value))
        {
            return BadRequest(string.Format(ApiReturnMessages.ParticipantDoesNotExist, initialPaymentParticipant));
        }

        var submittedByParticipant = request.GetValue<int>("/submitted_by");
        if (submittedByParticipant.Exists && !await _participantService.ParticipantExists(submittedByParticipant.Value))
        {
            return BadRequest(string.Format(ApiReturnMessages.ParticipantDoesNotExist, submittedByParticipant));
        }

        var noticeId = request.GetValue<int>("/original_notice_id");
        if (noticeId.Exists && !await _noticeService.NoticeExists(noticeId.Value))
        {
            return BadRequest(string.Format(ApiReturnMessages.NoticeDoesNotExist, noticeId));
        }

        DisputeSetContext(disputeGuid);
        _mapper.Map(newDispute, originalDispute);
        originalDispute.DisputeId = id;
        var resultDispute = await _disputeService.PatchDisputeAsync(originalDispute);
        EntityIdSetContext(id);

        if (resultDispute != null)
        {
            var disputeResponse = _mapper.Map<Dispute, DisputeResponse>(resultDispute);
            disputeResponse.LastDisputeStatus = await _disputeService.GetDisputeLastStatusAsync(disputeGuid);

            return Ok(disputeResponse);
        }

        return BadRequest(request);
    }

    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser })]
    [HttpPost("status/{disputeGuid:Guid}")]
    public async Task<IActionResult> PostDisputeStatus([FromBody]DisputeStatusPostRequest request, Guid disputeGuid)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var isFirstStatus = await _disputeService.IfFirstStatus(disputeGuid);
        if (isFirstStatus)
        {
            if (request.Status == null || request.Stage == null)
            {
                return BadRequest(ApiReturnMessages.FirstDisputeStatus);
            }
        }
        else
        {
            if (request.Status == null && request.Stage == null && (request.Process == null && request.Owner == null))
            {
                return BadRequest(ApiReturnMessages.AtLeastOne);
            }
        }

        DisputeSetContext(disputeGuid);
        var userId = GetLoggedInUserId();
        var result = await _disputeService.PostDisputeStatusAsync(request, disputeGuid, userId);
        if (result != null)
        {
            EntityIdSetContext(result.DisputeStatusId);
            return Ok(result);
        }

        return BadRequest();
    }

    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser })]
    [HttpGet("disputestatuses/{disputeGuid:Guid}")]
    public async Task<IActionResult> GetDisputeStatuses(Guid disputeGuid)
    {
        var disputeStatuses = await _disputeService.GetDisputeStatusesAsync(disputeGuid);
        if (disputeStatuses != null)
        {
            return Ok(disputeStatuses);
        }

        return NotFound();
    }

    private async Task<bool> ValidateDisputeOwner(Guid disputeGuid, int disputeOwnerId)
    {
        var disputeUsers = await _disputeService.GetDisputeUsersAsync(disputeGuid);
        return disputeUsers.Any(x => x.SystemUserId == disputeOwnerId);
    }
}