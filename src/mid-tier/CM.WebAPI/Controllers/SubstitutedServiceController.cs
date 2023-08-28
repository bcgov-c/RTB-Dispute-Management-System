using System;
using System.Threading.Tasks;
using CM.Business.Entities.Models.SubstitutedService;
using CM.Business.Services.DisputeServices;
using CM.Business.Services.Files;
using CM.Business.Services.OutcomeDocument;
using CM.Business.Services.Parties;
using CM.Business.Services.SubstitutedService;
using CM.Business.Services.UserServices;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Route("api/substitutedservice")]
[Produces(Application.Json)]
public class SubstitutedServiceController : BaseController
{
    private readonly IDisputeService _disputeService;
    private readonly IFileDescriptionService _fileDescriptionService;
    private readonly IOutcomeDocFileService _outcomeDocumentService;
    private readonly IParticipantService _participantService;
    private readonly ISubstitutedService _substitutedService;
    private readonly IUserService _userService;

    public SubstitutedServiceController(ISubstitutedService substitutedService, IDisputeService disputeService, IParticipantService participantService, IFileDescriptionService fileDescriptionService, IUserService userService, IOutcomeDocFileService outcomeDocumentService)
    {
        _substitutedService = substitutedService;
        _disputeService = disputeService;
        _participantService = participantService;
        _fileDescriptionService = fileDescriptionService;
        _userService = userService;
        _outcomeDocumentService = outcomeDocumentService;
    }

    [HttpPost("{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser, RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> Post(Guid disputeGuid, [FromBody]SubstitutedServicePostRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var validateResult = await ValidatePostRequest(disputeGuid, request);

        if (validateResult.GetType() != typeof(OkResult))
        {
            return validateResult;
        }

        DisputeSetContext(disputeGuid);
        var newSubService = await _substitutedService.CreateAsync(disputeGuid, request);
        EntityIdSetContext(newSubService.SubstitutedServiceId);
        return Ok(newSubService);
    }

    [HttpPatch("{substitutedServiceId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Patch(int substitutedServiceId, [FromBody]JsonPatchDocumentExtension<SubstitutedServicePatchRequest> request)
    {
        if (CheckModified(_substitutedService, substitutedServiceId))
        {
            return StatusConflicted();
        }

        var subServiceToPatch = await _substitutedService.GetSubServiceForPatchAsync(substitutedServiceId);
        if (subServiceToPatch != null)
        {
            request.ApplyTo(subServiceToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var validateResult = await ValidatePatchRequest(request);

            if (validateResult.GetType() != typeof(OkResult))
            {
                return validateResult;
            }

            await DisputeResolveAndSetContext(_substitutedService, substitutedServiceId);
            var result = await _substitutedService.PatchAsync(substitutedServiceId, subServiceToPatch);

            if (result != null)
            {
                EntityIdSetContext(substitutedServiceId);
                return Ok(result);
            }
        }
        else
        {
            return NotFound(string.Format(ApiReturnMessages.SubServiceNotFound, substitutedServiceId));
        }

        return NotFound();
    }

    [HttpDelete("{subServiceId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited })]
    public async Task<IActionResult> Delete(int subServiceId)
    {
        if (CheckModified(_substitutedService, subServiceId))
        {
            return StatusConflicted();
        }

        await DisputeResolveAndSetContext(_substitutedService, subServiceId);
        var result = await _substitutedService.DeleteAsync(subServiceId);
        if (result)
        {
            EntityIdSetContext(subServiceId);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }

    [HttpGet("{subServiceId:int}")]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited })]
    public async Task<IActionResult> GetById(int subServiceId)
    {
        var substitutedService = await _substitutedService.GetSubServiceAsync(subServiceId);
        if (substitutedService != null)
        {
            return Ok(substitutedService);
        }

        return NotFound();
    }

    [HttpGet("/api/disputesubstitutedservices/{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> GetByDisputeGuid(Guid disputeGuid)
    {
        var substitutedServices = await _substitutedService.GetByDisputeGuidAsync(disputeGuid);
        if (substitutedServices != null)
        {
            return Ok(substitutedServices);
        }

        return NotFound();
    }

    [HttpGet("/api/externaldisputesubstitutedservices/{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser, RoleNames.OfficePay })]
    public async Task<IActionResult> GetExternalDisputeSubstitutedServices(Guid disputeGuid)
    {
        var externalSubstitutedServices = await _substitutedService.GetExternalDisputeSubstitutedServices(disputeGuid);
        if (externalSubstitutedServices != null)
        {
            return Ok(externalSubstitutedServices);
        }

        return NotFound();
    }

    #region Private

    private async Task<ActionResult> ValidatePatchRequest(JsonPatchDocumentExtension<SubstitutedServicePatchRequest> request)
    {
        var serviceByParticipantId = request.GetValue<int>("/service_by_participant_id");
        if (serviceByParticipantId.Exists)
        {
            var serviceByParticipant = await _participantService.GetByIdAsync(serviceByParticipantId.Value);
            if (serviceByParticipant == null)
            {
                return BadRequest(string.Format(ApiReturnMessages.ServiceByParticipantNotExists, serviceByParticipantId.Value));
            }

            if (serviceByParticipant.ParticipantStatus is (byte)ParticipantStatus.Removed or (byte)ParticipantStatus.Deleted)
            {
                return BadRequest(string.Format(ApiReturnMessages.ParticipantRemovedOrDeleted, serviceByParticipantId.Value));
            }
        }

        var serviceToParticipantId = request.GetValue<int>("/service_to_participant_id");
        if (serviceToParticipantId.Exists)
        {
            var serviceToParticipant = await _participantService.GetByIdAsync(serviceToParticipantId.Value);
            if (serviceToParticipant == null)
            {
                return BadRequest(string.Format(ApiReturnMessages.ServiceToParticipantNotExists, serviceToParticipantId.Value));
            }

            if (serviceToParticipant.ParticipantStatus is (byte)ParticipantStatus.Removed or (byte)ParticipantStatus.Deleted)
            {
                return BadRequest(string.Format(ApiReturnMessages.ParticipantRemovedOrDeleted, serviceToParticipantId.Value));
            }
        }

        bool isFileDescExist;

        var failedMethod1FileDescId = request.GetValue<int>("/failed_method1_file_desc_id");
        if (failedMethod1FileDescId.Exists)
        {
            isFileDescExist = await _fileDescriptionService.FileDescriptionExists(failedMethod1FileDescId.Value);
            if (!isFileDescExist)
            {
                return BadRequest(string.Format(ApiReturnMessages.FileDescriptionDoesNotExist, "failed_method1_file_desc_id", failedMethod1FileDescId.Value));
            }
        }

        var failedMethod2FileDescId = request.GetValue<int>("/failed_method2_file_desc_id");
        if (failedMethod2FileDescId.Exists)
        {
            isFileDescExist = await _fileDescriptionService.FileDescriptionExists(failedMethod2FileDescId.Value);
            if (!isFileDescExist)
            {
                return BadRequest(string.Format(ApiReturnMessages.FileDescriptionDoesNotExist, "failed_method2_file_desc_id", failedMethod2FileDescId.Value));
            }
        }

        var failedMethod3FileDescId = request.GetValue<int>("/failed_method3_file_desc_id");
        if (failedMethod3FileDescId.Exists)
        {
            isFileDescExist = await _fileDescriptionService.FileDescriptionExists(failedMethod3FileDescId.Value);
            if (!isFileDescExist)
            {
                return BadRequest(string.Format(ApiReturnMessages.FileDescriptionDoesNotExist, "failed_method3_file_desc_id", failedMethod3FileDescId.Value));
            }
        }

        var subServiceApprovedById = request.GetValue<int>("/sub_service_approved_by");
        if (subServiceApprovedById.Exists)
        {
            var user = await _userService.GetSystemUser(subServiceApprovedById.Value);
            if (user is not { SystemUserRoleId: (int)Roles.StaffUser })
            {
                return BadRequest(string.Format(ApiReturnMessages.SubServiceApprovedByIncorrect, subServiceApprovedById.Value));
            }
        }

        var outcomeDocumentFileId = request.GetValue<int>("/outcome_document_file_id");
        if (outcomeDocumentFileId.Exists)
        {
            var outcomeDocumentFileExists = await _outcomeDocumentService.OutcomeDocFileExists(outcomeDocumentFileId.Value);
            if (!outcomeDocumentFileExists)
            {
                return BadRequest(string.Format(ApiReturnMessages.OutcomeDocFileDoesNotExist, outcomeDocumentFileId.Value));
            }
        }

        return new OkResult();
    }

    private async Task<ActionResult> ValidatePostRequest(Guid disputeGuid, SubstitutedServicePostRequest request)
    {
        var disputeExists = await _disputeService.DisputeExistsAsync(disputeGuid);
        if (!disputeExists)
        {
            return BadRequest(string.Format(ApiReturnMessages.DisputeDoesNotExist, disputeGuid));
        }

        var serviceByParticipant = await _participantService.GetByIdAsync(request.ServiceByParticipantId);
        if (serviceByParticipant == null)
        {
            return BadRequest(string.Format(ApiReturnMessages.ServiceByParticipantNotExists, request.ServiceByParticipantId));
        }

        if (serviceByParticipant.ParticipantStatus is (byte)ParticipantStatus.Removed or (byte)ParticipantStatus.Deleted)
        {
            return BadRequest(string.Format(ApiReturnMessages.ParticipantRemovedOrDeleted, request.ServiceByParticipantId));
        }

        var serviceToParticipant = await _participantService.GetByIdAsync(request.ServiceToParticipantId);
        if (serviceToParticipant == null)
        {
            return BadRequest(string.Format(ApiReturnMessages.ServiceToParticipantNotExists, request.ServiceToParticipantId));
        }

        if (serviceToParticipant.ParticipantStatus is (byte)ParticipantStatus.Removed or (byte)ParticipantStatus.Deleted)
        {
            return BadRequest(string.Format(ApiReturnMessages.ParticipantRemovedOrDeleted, request.ServiceToParticipantId));
        }

        bool isFileDescExist;

        if (request.FailedMethod1FileDescId.HasValue)
        {
            isFileDescExist = await _fileDescriptionService.FileDescriptionExists(request.FailedMethod1FileDescId.Value);
            if (!isFileDescExist)
            {
                return BadRequest(string.Format(ApiReturnMessages.FileDescriptionDoesNotExist, request.FailedMethod1FileDescId.ToString(), request.FailedMethod1FileDescId.Value));
            }
        }

        if (request.FailedMethod2FileDescId.HasValue)
        {
            isFileDescExist = await _fileDescriptionService.FileDescriptionExists(request.FailedMethod2FileDescId.Value);
            if (!isFileDescExist)
            {
                return BadRequest(string.Format(ApiReturnMessages.FileDescriptionDoesNotExist, request.FailedMethod2FileDescId.ToString(), request.FailedMethod2FileDescId.Value));
            }
        }

        if (request.FailedMethod3FileDescId.HasValue)
        {
            isFileDescExist = await _fileDescriptionService.FileDescriptionExists(request.FailedMethod3FileDescId.Value);
            if (!isFileDescExist)
            {
                return BadRequest(string.Format(ApiReturnMessages.FileDescriptionDoesNotExist, request.FailedMethod3FileDescId.ToString(), request.FailedMethod3FileDescId.Value));
            }
        }

        if (request.RequestMethodFileDescId.HasValue)
        {
            isFileDescExist = await _fileDescriptionService.FileDescriptionExists(request.RequestMethodFileDescId.Value);
            if (!isFileDescExist)
            {
                return BadRequest(string.Format(ApiReturnMessages.FileDescriptionDoesNotExist, request.RequestMethodFileDescId.ToString(), request.RequestMethodFileDescId.Value));
            }
        }

        if (request.SubServiceApprovedById.HasValue)
        {
            var user = await _userService.GetSystemUser(request.SubServiceApprovedById.Value);
            if (user is not { SystemUserRoleId: (int)Roles.StaffUser })
            {
                return BadRequest(string.Format(ApiReturnMessages.SubServiceApprovedByIncorrect, request.SubServiceApprovedById.Value));
            }
        }

        if (request.OutcomeDocumentFileId.HasValue)
        {
            var outcomeDocumentFileExists = await _outcomeDocumentService.OutcomeDocFileExists(request.OutcomeDocumentFileId.Value);
            if (!outcomeDocumentFileExists)
            {
                return BadRequest(string.Format(ApiReturnMessages.OutcomeDocFileDoesNotExist, request.OutcomeDocumentFileId.Value));
            }
        }

        return new OkResult();
    }

    #endregion
}