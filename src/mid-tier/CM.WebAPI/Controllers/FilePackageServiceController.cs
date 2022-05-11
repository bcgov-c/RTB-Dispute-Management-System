using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.FilePackageService;
using CM.Business.Services.FilePackageService;
using CM.Business.Services.Files;
using CM.Business.Services.Parties;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using CM.WebAPI.WebApiHelpers;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/filepackageservice")]
public class FilePackageServiceController : BaseController
{
    private readonly IFileDescriptionService _fileDescriptionService;
    private readonly IFilePackageService _filePackageService;
    private readonly IFilePackageServiceService _filePackageServiceService;
    private readonly IMapper _mapper;
    private readonly IParticipantService _participantService;

    public FilePackageServiceController(IFilePackageServiceService filePackageServiceService, IFilePackageService filePackageService, IParticipantService participantService, IMapper mapper, IFileDescriptionService fileDescriptionService)
    {
        _filePackageServiceService = filePackageServiceService;
        _filePackageService = filePackageService;
        _participantService = participantService;
        _fileDescriptionService = fileDescriptionService;
        _mapper = mapper;
    }

    [HttpPost("{filePackageId:int}")]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Post(int filePackageId, [FromBody]FilePackageServiceRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var filePackage = await _filePackageService.GetByIdAsync(filePackageId);
        if (filePackage == null)
        {
            return BadRequest(string.Format(ApiReturnMessages.FilePackageDoesNotExist, filePackageId));
        }

        if (request.ParticipantId.HasValue)
        {
            var participant = await _participantService.GetByIdAsync(request.ParticipantId.Value);
            if (filePackage.DisputeGuid != participant.DisputeGuid)
            {
                return BadRequest(ApiReturnMessages.InvalidParticipant);
            }

            if (!string.IsNullOrEmpty(request.OtherParticipantName))
            {
                return BadRequest(ApiReturnMessages.OtherParticipantNameConflictParticipantId);
            }

            if (request.ServedBy.HasValue)
            {
                if (request.ServedBy.Value == participant.ParticipantId)
                {
                    return BadRequest(ApiReturnMessages.ServedByConflictParticipantId);
                }

                var servedParticipant = await _participantService.GetByIdAsync(request.ServedBy.Value);
                if (servedParticipant == null || servedParticipant.DisputeGuid != participant.DisputeGuid)
                {
                    return BadRequest(ApiReturnMessages.ServedByIsInvalid);
                }
            }
        }

        if (request.ProofFileDescriptionId != null)
        {
            var fileDescription = await _fileDescriptionService.GetAsync(request.ProofFileDescriptionId.Value);
            if (fileDescription.DisputeGuid != filePackage.DisputeGuid)
            {
                return BadRequest(string.Format(ApiReturnMessages.FileDescriptionInvalid, request.ProofFileDescriptionId.Value, filePackage.DisputeGuid));
            }
        }

        await DisputeResolveAndSetContext(_filePackageService, filePackageId);
        var result = await _filePackageServiceService.CreateAsync(filePackageId, request);
        EntityIdSetContext(result.FilePackageServiceId);
        return Ok(result);
    }

    [HttpPatch("{filePackageServiceId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Patch(int filePackageServiceId, [FromBody]JsonPatchDocumentExtension<FilePackageServicePatchRequest> filePackageService)
    {
        if (CheckModified(_filePackageServiceService, filePackageServiceId))
        {
            return StatusConflicted();
        }

        var originalFilePackageService = await _filePackageServiceService.GetNoTrackingFilePackageServiceAsync(filePackageServiceId);
        if (originalFilePackageService != null)
        {
            var filePackageServiceToPatch = _mapper.Map<Data.Model.FilePackageService, FilePackageServicePatchRequest>(originalFilePackageService);
            filePackageService.ApplyTo(filePackageServiceToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var servedByRequest = filePackageService.GetValue<int>("/served_by");
            if (servedByRequest.Exists)
            {
                if (servedByRequest.Value == originalFilePackageService.Participant.ParticipantId)
                {
                    return BadRequest(ApiReturnMessages.ServedByConflictParticipantId);
                }

                var servedParticipant = await _participantService.GetByIdAsync(servedByRequest.Value);
                if (servedParticipant == null || servedParticipant.DisputeGuid != originalFilePackageService.Participant.DisputeGuid)
                {
                    return BadRequest(ApiReturnMessages.ServedByIsInvalid);
                }
            }

            var proofFileDescriptionId = filePackageService.GetValue<int?>("/proof_file_description_id");
            if (proofFileDescriptionId.Exists && proofFileDescriptionId.Value.HasValue)
            {
                var fileDescription = await _fileDescriptionService.GetAsync(proofFileDescriptionId.Value.Value);
                var filePackage = await _filePackageService.GetByIdAsync(originalFilePackageService.FilePackageId);
                if (fileDescription.DisputeGuid != filePackage.DisputeGuid)
                {
                    return BadRequest(string.Format(ApiReturnMessages.FileDescriptionInvalid, proofFileDescriptionId.Value, filePackage.DisputeGuid));
                }
            }

            await DisputeResolveAndSetContext(_filePackageServiceService, filePackageServiceId);
            var result = await _filePackageServiceService.PatchAsync(filePackageServiceId, filePackageServiceToPatch);

            if (result != null)
            {
                EntityIdSetContext(filePackageServiceId);
                return Ok(result);
            }
        }
        else
        {
            return BadRequest(ApiReturnMessages.InvalidFilePackageService);
        }

        return NotFound();
    }

    [HttpDelete("{filePackageServiceId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Delete(int filePackageServiceId)
    {
        if (CheckModified(_filePackageServiceService, filePackageServiceId))
        {
            return StatusConflicted();
        }

        await DisputeResolveAndSetContext(_filePackageServiceService, filePackageServiceId);
        var result = await _filePackageServiceService.DeleteAsync(filePackageServiceId);
        if (result)
        {
            EntityIdSetContext(filePackageServiceId);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }
}