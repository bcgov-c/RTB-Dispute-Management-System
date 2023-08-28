using System;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Hearing;
using CM.Business.Entities.Models.OfficeUser;
using CM.Business.Entities.Models.RemedyDetail;
using CM.Business.Services.DisputeServices;
using CM.Business.Services.EmailMessages;
using CM.Business.Services.Files;
using CM.Business.Services.Hearings;
using CM.Business.Services.Notice;
using CM.Business.Services.OfficeUser;
using CM.Business.Services.Parties;
using CM.Business.Services.Payment;
using CM.Business.Services.RemedyDetails;
using CM.Business.Services.RemedyServices;
using CM.Business.Services.UserServices;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
public class OfficeUserController : BaseController
{
    private readonly IDisputeFeeService _disputeFeeService;
    private readonly IDisputeService _disputeService;
    private readonly IEmailMessageService _emailMessageService;
    private readonly IFileDescriptionService _fileDescriptionService;
    private readonly IHearingParticipationService _hearingParticipationService;
    private readonly IHearingService _hearingService;
    private readonly IMapper _mapper;
    private readonly INoticeService _noticeService;
    private readonly IOfficeUserService _officeUserService;
    private readonly IParticipantService _participantService;
    private readonly IRemedyDetailService _remedyDetailService;
    private readonly IRemedyService _remedyService;
    private readonly IUserService _userService;

    public OfficeUserController(IMapper mapper,
        IOfficeUserService officeUserService,
        IDisputeFeeService disputeFeeService,
        IDisputeService disputeService,
        INoticeService noticeService,
        IParticipantService participantService,
        IHearingParticipationService hearingParticipationService,
        IHearingService hearingService,
        IFileDescriptionService fileDescriptionService,
        IEmailMessageService emailMessageService,
        IRemedyDetailService remedyDetailService,
        IRemedyService remedyService,
        IUserService userService)
    {
        _mapper = mapper;
        _officeUserService = officeUserService;
        _disputeFeeService = disputeFeeService;
        _disputeService = disputeService;
        _noticeService = noticeService;
        _participantService = participantService;
        _hearingParticipationService = hearingParticipationService;
        _hearingService = hearingService;
        _fileDescriptionService = fileDescriptionService;
        _emailMessageService = emailMessageService;
        _remedyDetailService = remedyDetailService;
        _remedyService = remedyService;
        _userService = userService;
    }

    [HttpGet("api/externalupdate/disputedetails")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> GetDisputeDetails(OfficeUserGetDisputeRequest request)
    {
        if (request.SearchMethod == (byte)ExternalUpdateSearchMethod.AccessCode)
        {
            var participant = await _participantService.GetByAccessCode(request.AccessCode);
            if (participant is { ParticipantStatus: (byte)ParticipantStatus.Deleted or (byte)ParticipantStatus.Removed })
            {
                return BadRequest(ApiReturnMessages.ParticipantRemoved);
            }
        }

        var disputeDetails = await _officeUserService.GetDisputeDetails(request);
        if (disputeDetails != null)
        {
            return Ok(disputeDetails);
        }

        return request.SearchMethod switch
        {
            (byte)ExternalUpdateSearchMethod.FileNumber => BadRequest(ApiReturnMessages.FileNumberIsInvalid),
            (byte)ExternalUpdateSearchMethod.AccessCode => BadRequest(ApiReturnMessages.AccessCodeIsInvalid),
            _ => BadRequest()
        };
    }

    [HttpPost("api/externalupdate/newdispute")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.OfficePay })]
    public async Task<IActionResult> PostDispute([FromBody]OfficeUserPostDisputeRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var validationResult = ValidateParticipant(request);
        if (validationResult.GetType() != typeof(OkResult))
        {
            return validationResult;
        }

        var result = await _officeUserService.CreateDispute(request);
        EntityIdSetContext(result.DisputeId);
        return Ok(result);
    }

    [HttpPost("api/externalupdate/paymenttransaction/{disputeFeeId:int}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.OfficePay })]
    public async Task<IActionResult> PostTransaction(int disputeFeeId, [FromBody]OfficeUserPostTransactionRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var disputeFee = await _disputeFeeService.GetAsync(disputeFeeId);
        if (disputeFee == null)
        {
            return BadRequest(string.Format(ApiReturnMessages.DisputeFeeDoesNotExist, disputeFeeId));
        }

        if (request.TransactionBy != null)
        {
            var payor = await _participantService.GetAsync((int)request.TransactionBy);
            if (payor == null)
            {
                return BadRequest(string.Format(ApiReturnMessages.ParticipantDoesNotExist, (int)request.TransactionBy));
            }
        }

        if (request.PaymentStatus != (byte)PaymentStatus.Pending && request.PaymentStatus != (byte)PaymentStatus.ApprovedOrPaid && request.PaymentStatus != (byte)PaymentStatus.Rejected)
        {
            return BadRequest(ApiReturnMessages.PaymentStatusIsInvalid);
        }

        await DisputeResolveAndSetContext(_disputeFeeService, disputeFeeId);
        var result = await _officeUserService.CreatePaymentTransaction(disputeFeeId, request);
        var lastPaymentTransaction = result.PaymentTransactions.LastOrDefault();
        if (lastPaymentTransaction != null)
        {
            EntityIdSetContext(lastPaymentTransaction.PaymentTransactionId);
        }

        return Ok(result);
    }

    [HttpPatch("api/externalupdate/disputeinfo/{disputeGuid:Guid}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> PatchDisputeInfo(Guid disputeGuid, [FromBody]JsonPatchDocumentExtension<OfficeUserPatchDisputeRequest> request)
    {
        if (CheckModified(_officeUserService, disputeGuid))
        {
            return StatusConflicted();
        }

        var originalDispute = await _disputeService.GetDisputeNoTrackAsync(disputeGuid);
        if (originalDispute != null)
        {
            var disputeToPatch = _mapper.Map<Dispute, OfficeUserPatchDisputeRequest>(originalDispute);
            request.ApplyTo(disputeToPatch);

            await TryUpdateModelAsync(disputeToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            DisputeSetContext(disputeGuid);
            _mapper.Map(disputeToPatch, originalDispute);

            var result = await _officeUserService.PatchDispute(originalDispute);
            EntityIdSetContext(result.DisputeId);
            return Ok(_mapper.Map<Dispute, OfficeUserPatchDisputeResponse>(result));
        }

        return NotFound();
    }

    [HttpPost("api/externalupdate/notice/{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> PostNotice(Guid disputeGuid, [FromBody]OfficeUserPostNoticeRequest request)
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

        if (request.ParentNoticeId > 0)
        {
            var parentNotice = await _noticeService.GetByIdAsync(request.ParentNoticeId);
            if (parentNotice == null)
            {
                return BadRequest(ApiReturnMessages.InvalidParentNotice);
            }
        }
        else
        {
            return BadRequest(ApiReturnMessages.ParentNoticeRequired);
        }

        var participantExists = await _noticeService.IfDisputeParticipantExists(request.NoticeDeliveredTo, disputeGuid);
        if (!participantExists)
        {
            return BadRequest(string.Format(ApiReturnMessages.ParticipantWithDisputeDoesNotExist, request.NoticeDeliveredTo, disputeGuid));
        }

        var fileDescription = await _fileDescriptionService.GetAsync(request.NoticeFileDescriptionId);
        if (fileDescription.DisputeGuid != disputeGuid)
        {
            return BadRequest(string.Format(ApiReturnMessages.FileDescriptionInvalid, request.NoticeFileDescriptionId, disputeGuid));
        }

        DisputeSetContext(disputeGuid);
        var result = await _officeUserService.CreateNotice(disputeGuid, request);
        EntityIdSetContext(result.NoticeId);
        return Ok(result);
    }

    [HttpGet("api/externalupdate/pickupmessage/{emailMessageId:int}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser, RoleNames.OfficePay })]
    public async Task<IActionResult> GetPickupMessage(int emailMessageId)
    {
        var pickupMessage = await _officeUserService.GetPickupMessage(emailMessageId);
        if (pickupMessage != null)
        {
            if (pickupMessage.MessageType < (byte)EmailMessageType.Pickup
                || pickupMessage.SendStatus != (byte)EmailStatus.NotPickedUp)
            {
                return BadRequest(ApiReturnMessages.InvalidPickupMessage);
            }

            return Ok(pickupMessage);
        }

        return NotFound();
    }

    [HttpPatch("api/externalupdate/setpickupmessagestatus/{emailMessageId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser, RoleNames.OfficePay })]
    public async Task<IActionResult> SetPickupMessageStatus(int emailMessageId)
    {
        if (CheckModified(_officeUserService, emailMessageId))
        {
            return StatusConflicted();
        }

        var originalEmailMessage = await _emailMessageService.GetByIdAsync(emailMessageId);
        if (originalEmailMessage != null)
        {
            if (originalEmailMessage.MessageType < (byte)EmailMessageType.Pickup
                && originalEmailMessage.SendStatus != (byte)EmailStatus.NotPickedUp)
            {
                return BadRequest(ApiReturnMessages.InvalidPickupMessage);
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _emailMessageService.SetPickupMessageStatus(emailMessageId);
            if (result)
            {
                return Ok(ApiReturnMessages.Ok);
            }
        }

        return NotFound();
    }

    [HttpPost("api/externalupdate/hearingpreparticipation/{hearingId:int}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> PostHearingParticipation(
        int hearingId,
        [FromQuery] int participantId,
        [FromQuery] Guid disputeGuid,
        [FromBody] ExternalHearingParticipationRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var hearing = await _hearingService.GetHearingAsync(hearingId);
        if (hearing == null || hearing.LocalStartDateTime <= DateTime.UtcNow)
        {
            return BadRequest(ApiReturnMessages.NotFutureHearing);
        }

        if (!await _disputeService.DisputeExistsAsync(disputeGuid))
        {
            return BadRequest(string.Format(ApiReturnMessages.DisputeDoesNotExist, disputeGuid));
        }

        var participant = await _participantService.GetAsync(participantId);
        if (participant == null)
        {
            return BadRequest(string.Format(ApiReturnMessages.ParticipantDoesNotExist, participantId));
        }
        else if (participant.DisputeGuid != disputeGuid
                 || participant.ParticipantStatus == (byte)ParticipantStatus.Deleted
                 || participant.ParticipantStatus == (byte)ParticipantStatus.Removed)
        {
            return BadRequest(string.Format(ApiReturnMessages.InvalidParticipantOnDispute, participantId));
        }

        if (request.ParticipationStatusBy.HasValue)
        {
            var user = await _userService.GetSystemUser(request.ParticipationStatusBy.Value);
            var isDisputeUser = await _disputeService.IsDisputeUser(disputeGuid, user.SystemUserId);
            if (user == null || (user.SystemUserRoleId != (int)Roles.StaffUser && !isDisputeUser))
            {
                return BadRequest(ApiReturnMessages.InvalidParticipationStatusBy);
            }
        }

        if (request.PreParticipationStatusBy.HasValue)
        {
            var user = await _userService.GetSystemUser(request.PreParticipationStatusBy.Value);
            var isDisputeUser = await _disputeService.IsDisputeUser(disputeGuid, user.SystemUserId);
            if (user == null || (user.SystemUserRoleId != (int)Roles.StaffUser && !isDisputeUser))
            {
                return BadRequest(ApiReturnMessages.InvalidPreParticipationStatusBy);
            }
        }

        var isHearingParticipantExists = await _hearingParticipationService.HearingParticipantExists(participantId);
        if (isHearingParticipantExists)
        {
            return BadRequest(ApiReturnMessages.HearingParticipantExistsForParticipant);
        }

        var result = await _hearingParticipationService.CreateAsync(hearingId, participantId, disputeGuid, request);
        EntityIdSetContext(result.HearingParticipationId);
        return Ok(result);
    }

    [HttpPatch("api/externalupdate/hearingpreparticipation/{hearingId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> PatchHearingParticipation(int hearingId, [FromQuery] int participantId, [FromQuery] Guid disputeGuid, [FromBody] JsonPatchDocumentExtension<OfficeUserPatchHearingParticipantRequest> request)
    {
        var hearing = await _hearingService.GetHearingAsync(hearingId);
        if (hearing == null || hearing.LocalStartDateTime <= DateTime.UtcNow)
        {
            return BadRequest(ApiReturnMessages.NotFutureHearing);
        }

        if (!await _disputeService.DisputeExistsAsync(disputeGuid))
        {
            return BadRequest(string.Format(ApiReturnMessages.DisputeDoesNotExist, disputeGuid));
        }

        var participant = await _participantService.GetAsync(participantId);
        if (participant == null)
        {
            return BadRequest(string.Format(ApiReturnMessages.ParticipantDoesNotExist, participantId));
        }
        else if (participant.DisputeGuid != disputeGuid
                 || participant.ParticipantStatus == (byte)ParticipantStatus.Deleted
                 || participant.ParticipantStatus == (byte)ParticipantStatus.Removed)
        {
            return BadRequest(string.Format(ApiReturnMessages.InvalidParticipantOnDispute, participantId));
        }

        var(participationStatusByExists, participationStatusBy) = request.GetValue<int?>("/participation_status_by");
        if (participationStatusByExists)
        {
            var user = await _userService.GetSystemUser(participationStatusBy.Value);
            var isDisputeUser = await _disputeService.IsDisputeUser(disputeGuid, user.SystemUserId);
            if (user == null || (user.SystemUserRoleId != (int)Roles.StaffUser && !isDisputeUser))
            {
                return BadRequest(ApiReturnMessages.InvalidParticipationStatusBy);
            }
        }

        var(preParticipationStatusByExists, preParticipationStatusBy) = request.GetValue<int?>("/pre_participation_status_by");
        if (preParticipationStatusByExists)
        {
            var user = await _userService.GetSystemUser(preParticipationStatusBy.Value);
            var isDisputeUser = await _disputeService.IsDisputeUser(disputeGuid, user.SystemUserId);
            if (user == null || (user.SystemUserRoleId != (int)Roles.StaffUser && !isDisputeUser))
            {
                return BadRequest(ApiReturnMessages.InvalidPreParticipationStatusBy);
            }
        }

        var originalHearingParticipation = await _hearingParticipationService.GetHearingParticipation(hearingId, participantId, disputeGuid);
        if (originalHearingParticipation != null)
        {
            var preParticipationStatus = request.GetValue<byte>("/pre_participation_status");
            if (originalHearingParticipation.PreParticipationStatus == null)
            {
                if (!preParticipationStatus.Exists)
                {
                    return BadRequest(ApiReturnMessages.PreParticipationStatusRequired);
                }
            }

            if (CheckModified(_hearingParticipationService, originalHearingParticipation.HearingParticipationId))
            {
                return StatusConflicted();
            }

            var hearingParticipationToPatch = _mapper.Map<HearingParticipation, OfficeUserPatchHearingParticipantRequest>(originalHearingParticipation);
            request.ApplyTo(hearingParticipationToPatch);

            await TryUpdateModelAsync(hearingParticipationToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _mapper.Map(hearingParticipationToPatch, originalHearingParticipation);
            originalHearingParticipation.HearingParticipationId = originalHearingParticipation.HearingParticipationId;
            var result = await _hearingParticipationService.PatchAsync(originalHearingParticipation);
            EntityIdSetContext(originalHearingParticipation.HearingParticipationId);
            return Ok(result);
        }

        return NotFound();
    }

    [HttpPost("api/externalupdate/remedydetails/{remedyId:int}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> PostRemedyDetails(int remedyId, [FromBody] OfficeUserPostRemedyDetail request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var activeRemedyExists = await _remedyService.ActiveRemedyExists(remedyId);
        if (!activeRemedyExists)
        {
            return BadRequest(string.Format(ApiReturnMessages.RemedyDoesNotExist, remedyId));
        }

        if (request.ParticipantId != 0)
        {
            var participantExists = await _participantService.IsActiveParticipantExists(request.ParticipantId);
            if (!participantExists)
            {
                return BadRequest(string.Format(ApiReturnMessages.ParticipantDoesNotExist, request.ParticipantId));
            }

            var remedy = await _remedyService.GetRemedyWithChildsAsync(remedyId);
            var participant = await _participantService.GetByIdAsync(request.ParticipantId);
            if (remedy.Claim.ClaimGroup.DisputeGuid != participant.DisputeGuid)
            {
                return BadRequest(string.Format(ApiReturnMessages.InvalidParticipantOnDispute, request.ParticipantId));
            }
        }

        await DisputeResolveAndSetContext(_remedyDetailService, remedyId);
        var remedyDetailsRequest = new RemedyDetailRequest
        {
            Amount = request.Amount,
            AssociatedDate = request.AssociatedDate,
            Description = request.Description,
            DescriptionBy = request.ParticipantId,
            PositionStatus = request.PositionStatus,
            IsAmended = null
        };
        var remedyDetailsResponse = await _remedyDetailService.CreateAsync(remedyId, remedyDetailsRequest);
        var result = _mapper.Map<RemedyDetailResponse, OfficeUserRemedyDetailResponse>(remedyDetailsResponse);
        EntityIdSetContext(result.RemedyDetailId);
        return Ok(result);
    }

    private ActionResult ValidateParticipant(OfficeUserPostDisputeRequest request)
    {
        if (request.ParticipantType == (byte)ParticipantType.Business)
        {
            if (string.IsNullOrWhiteSpace(request.BusinessName))
            {
                return BadRequest(ApiReturnMessages.BusinessNameIsRequired);
            }

            if (string.IsNullOrWhiteSpace(request.BusinessContactFirstName))
            {
                return BadRequest(ApiReturnMessages.BusinessFirstNameIsRequired);
            }

            if (string.IsNullOrWhiteSpace(request.BusinessContactLastName))
            {
                return BadRequest(ApiReturnMessages.BusinessLastNameIsRequired);
            }
        }

        if (request.ParticipantType != (byte)ParticipantType.Business)
        {
            if (string.IsNullOrWhiteSpace(request.FirstName))
            {
                return BadRequest(ApiReturnMessages.FirstNameIsRequired);
            }

            if (string.IsNullOrWhiteSpace(request.LastName))
            {
                return BadRequest(ApiReturnMessages.LastNameIsRequired);
            }
        }

        return new OkResult();
    }
}