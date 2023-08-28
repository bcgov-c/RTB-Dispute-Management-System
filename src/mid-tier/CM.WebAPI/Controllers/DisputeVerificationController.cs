using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.DisputeVerification;
using CM.Business.Entities.Models.VerificationAttempt;
using CM.Business.Services.DisputeHearing;
using CM.Business.Services.DisputeServices;
using CM.Business.Services.DisputeVerification;
using CM.Business.Services.Parties;
using CM.Business.Services.Payment;
using CM.Business.Services.UserServices;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers
{
    [Route("api/verification")]
    [Produces(Application.Json)]
    public class DisputeVerificationController : BaseController
    {
        private readonly IDisputeService _disputeService;
        private readonly IMapper _mapper;
        private readonly IParticipantService _participantService;
        private readonly IUserService _userService;
        private readonly IDisputeVerificationService _disputeVerificationService;
        private readonly IDisputeHearingService _disputeHearingService;
        private readonly IDisputeFeeService _disputeFeeService;

        public DisputeVerificationController(
            IMapper mapper,
            IDisputeService disputeService,
            IParticipantService participantService,
            IUserService userService,
            IDisputeVerificationService disputeVerificationService,
            IDisputeHearingService disputeHearingService,
            IDisputeFeeService disputeFeeService)
        {
            _disputeService = disputeService;
            _participantService = participantService;
            _userService = userService;
            _mapper = mapper;
            _disputeVerificationService = disputeVerificationService;
            _disputeHearingService = disputeHearingService;
            _disputeFeeService = disputeFeeService;
        }

        [HttpPost("disputeverification/{disputeGuid:Guid}")]
        [AuthorizationRequired(new[] { RoleNames.Admin })]
        public async Task<IActionResult> Post(Guid disputeGuid, [FromBody] DisputeVerificationPostRequest request)
        {
            TryValidateModel(request);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var disputeExists = await _disputeService.DisputeExistsAsync(disputeGuid);
            if (!disputeExists)
            {
                return BadRequest(string.Format(ApiReturnMessages.DisputeDoesNotExist, disputeGuid));
            }

            var isExistedDisputeHearing = await _disputeHearingService.IsExistedDisputeHearing(request.HearingId, disputeGuid);
            if (!isExistedDisputeHearing)
            {
                return BadRequest(ApiReturnMessages.HearingNotAssociatedToDispute);
            }

            if (request.DisputeFeeId.HasValue)
            {
                var disputeFee = await _disputeFeeService.GetAsync(request.DisputeFeeId.Value);
                if (disputeFee == null || disputeFee.DisputeGuid != disputeGuid)
                {
                    return BadRequest(ApiReturnMessages.InvalidOrUnassociatedDisputeFee);
                }
            }

            DisputeSetContext(disputeGuid);
            var newDisputeVerification = await _disputeVerificationService.CreateAsync(disputeGuid, request);
            EntityIdSetContext(newDisputeVerification.VerificationId);
            return Ok(newDisputeVerification);
        }

        [ApplyConcurrencyCheck]
        [HttpPatch("disputeverification/{verificationId:int}")]
        [AuthorizationRequired(new[] { RoleNames.Admin })]
        public async Task<IActionResult> Patch(int verificationId, [FromBody] JsonPatchDocumentExtension<DisputeVerificationPatchRequest> request)
        {
            if (CheckModified(_disputeVerificationService, verificationId))
            {
                return StatusConflicted();
            }

            var originalDisputeVerification = await _disputeVerificationService.GetById(verificationId);
            if (originalDisputeVerification != null)
            {
                var disputeVerificationToPatch = _mapper.Map<Data.Model.DisputeVerification, DisputeVerificationPatchRequest>(originalDisputeVerification);
                request.ApplyTo(disputeVerificationToPatch);
                TryValidateModel(request);
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var hearingId = request.GetValue<int>("/hearing_id");
                if (hearingId.Exists && !await _disputeHearingService.IsExistedDisputeHearing(hearingId.Value, originalDisputeVerification.DisputeGuid))
                {
                    return BadRequest(ApiReturnMessages.HearingNotAssociatedToDispute);
                }

                var disputeFeeId = request.GetValue<int?>("/dispute_fee_id");
                if (disputeFeeId.Exists)
                {
                    var disputeFee = await _disputeFeeService.GetAsync(disputeFeeId.Value.Value);

                    if (disputeFee == null || disputeFee.DisputeGuid != originalDisputeVerification.DisputeGuid)
                    {
                        return BadRequest(ApiReturnMessages.InvalidOrUnassociatedDisputeFee);
                    }
                }

                var refundIncluded = request.GetValue<bool?>("/is_refund_included");
                if (refundIncluded.Exists && refundIncluded.Value == true)
                {
                    if (originalDisputeVerification.DisputeFeeId == null && !disputeFeeId.Exists)
                    {
                        return BadRequest(ApiReturnMessages.InvalidRefundIncluded);
                    }
                }

                var refundInitiatedBy = request.GetValue<int?>("/refund_intitated_by");
                if (refundInitiatedBy.Exists)
                {
                    var isAdmin = await _userService.UserIsAdmin(refundInitiatedBy.Value.Value);
                    if (!isAdmin)
                    {
                        return BadRequest(ApiReturnMessages.InvalidRefundInitiatedBy);
                    }
                }

                await DisputeResolveAndSetContext(_disputeVerificationService, verificationId);
                var result = await _disputeVerificationService.PatchDisputeVerificationAsync(verificationId, disputeVerificationToPatch);

                if (result != null)
                {
                    EntityIdSetContext(verificationId);
                    return Ok(result);
                }
            }

            return NotFound();
        }

        [HttpDelete("disputeverification/{verificationId:int}")]
        [AuthorizationRequired(new[] { RoleNames.Admin })]
        [ApplyConcurrencyCheck]
        public async Task<IActionResult> Delete(int verificationId)
        {
            var isAssignedAttemptsExists = await _disputeVerificationService.IsAssignedAttemptsExists(verificationId);
            if (isAssignedAttemptsExists)
            {
                return BadRequest(ApiReturnMessages.AssignedAttemptsExists);
            }

            if (CheckModified(_disputeVerificationService, verificationId))
            {
                return StatusConflicted();
            }

            await DisputeResolveAndSetContext(_disputeVerificationService, verificationId);
            var result = await _disputeVerificationService.DeleteAsync(verificationId);
            if (result)
            {
                EntityIdSetContext(verificationId);
                return Ok(ApiReturnMessages.Deleted);
            }

            return NotFound();
        }

        [HttpPost("verificationattempt/{verificationId:int}")]
        [AuthorizationRequired(new[] { RoleNames.Admin })]
        public async Task<IActionResult> PostAttempt(int verificationId, [FromBody] VerificationAttemptPostRequest request)
        {
            TryValidateModel(request);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var disputeVerification = await _disputeVerificationService.GetById(verificationId);
            if (disputeVerification == null)
            {
                return BadRequest(string.Format(ApiReturnMessages.DisputeVerificationDoesNotExist));
            }

            var participant = await _participantService.GetAsync(request.ParticipantId);
            if (participant == null || participant.DisputeGuid != disputeVerification.DisputeGuid)
            {
                return BadRequest(string.Format(ApiReturnMessages.InvalidParticipantForVerification));
            }

            DisputeSetContext(disputeVerification.DisputeGuid);
            var newVerificationAttempt = await _disputeVerificationService.CreateAttemptAsync(verificationId, request);
            EntityIdSetContext(newVerificationAttempt.VerificationAttemptId);
            return Ok(newVerificationAttempt);
        }

        [ApplyConcurrencyCheck]
        [HttpPatch("verificationattempt/{verificationAttemptId:int}")]
        [AuthorizationRequired(new[] { RoleNames.Admin })]
        public async Task<IActionResult> PatchAttempt(int verificationAttemptId, [FromBody] JsonPatchDocumentExtension<VerificationAttemptPatchRequest> request)
        {
            if (CheckModified(_disputeVerificationService, verificationAttemptId))
            {
                return StatusConflicted();
            }

            var originalVerificationAttempt = await _disputeVerificationService.GetAttemptById(verificationAttemptId);
            if (originalVerificationAttempt != null)
            {
                var disputeVerificationAttemptToPatch = _mapper.Map<Data.Model.VerificationAttempt, VerificationAttemptPatchRequest>(originalVerificationAttempt);
                request.ApplyTo(disputeVerificationAttemptToPatch);
                TryValidateModel(disputeVerificationAttemptToPatch);
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                await DisputeResolveAndSetContext(_disputeVerificationService, verificationAttemptId);
                var result = await _disputeVerificationService.PatchVerificationAttemptAsync(verificationAttemptId, disputeVerificationAttemptToPatch);

                if (result != null)
                {
                    EntityIdSetContext(verificationAttemptId);
                    return Ok(result);
                }
            }

            return NotFound();
        }

        [HttpDelete("verificationattempt/{verificationAttemptId:int}")]
        [AuthorizationRequired(new[] { RoleNames.Admin })]
        [ApplyConcurrencyCheck]
        public async Task<IActionResult> DeleteAttempt(int verificationAttemptId)
        {
            await DisputeResolveAndSetContext(_disputeVerificationService, verificationAttemptId);
            if (CheckModified(_disputeVerificationService, verificationAttemptId))
            {
                return StatusConflicted();
            }

            await DisputeResolveAndSetContext(_disputeVerificationService, verificationAttemptId);
            var result = await _disputeVerificationService.DeleteAttemptAsync(verificationAttemptId);
            if (result)
            {
                EntityIdSetContext(verificationAttemptId);
                return Ok(ApiReturnMessages.Deleted);
            }

            return NotFound();
        }

        [HttpGet("disputeverification/{disputeVerificationId:int}")]
        [AuthorizationRequired(new[] { RoleNames.Admin })]
        public async Task<IActionResult> Get(int disputeVerificationId)
        {
            var disputeVerification = await _disputeVerificationService.GetDisputeVerification(disputeVerificationId);
            if (disputeVerification != null)
            {
                return Ok(disputeVerification);
            }

            return NotFound();
        }

        [HttpGet("disputeverifications/{disputeGuid:Guid}")]
        [AuthorizationRequired(new[] { RoleNames.Admin })]
        public async Task<IActionResult> GetDisputeVerifications(Guid disputeGuid)
        {
            var disputeExists = await _disputeService.DisputeExistsAsync(disputeGuid);
            if (!disputeExists)
            {
                return BadRequest(ApiReturnMessages.InvalidDisputeGuid);
            }

            var disputeVerifications = await _disputeVerificationService.GetDisputeVerifications(disputeGuid);
            if (disputeVerifications != null)
            {
                return Ok(disputeVerifications);
            }

            return NotFound();
        }
    }
}
