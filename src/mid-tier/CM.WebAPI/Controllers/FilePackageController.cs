using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Files;
using CM.Business.Services.Files;
using CM.Business.Services.Parties;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/filepackage")]
public class FilePackageController : BaseController
{
    private readonly IFilePackageService _filePackageService;
    private readonly IMapper _mapper;
    private readonly IParticipantService _participantService;

    public FilePackageController(IFilePackageService filePackageService, IParticipantService participantService, IMapper mapper)
    {
        _filePackageService = filePackageService;
        _participantService = participantService;
        _mapper = mapper;
    }

    [HttpPost("{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser, RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> Post(Guid disputeGuid, [FromBody]FilePackageRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (request.CreatedById == null && string.IsNullOrEmpty(request.CreatedByAccessCode))
        {
            return BadRequest(ApiReturnMessages.CreatorIdAccessCodeRequired);
        }

        if (request.CreatedById.HasValue)
        {
            var participant = await _participantService.GetAsync(request.CreatedById.Value);

            if (participant == null)
            {
                return BadRequest(string.Format(ApiReturnMessages.ParticipantDoesNotExist, request.CreatedById.Value));
            }

            if (participant.DisputeGuid != disputeGuid)
            {
                return BadRequest(ApiReturnMessages.NotAssociatedToDispute);
            }
        }

        if (!string.IsNullOrEmpty(request.CreatedByAccessCode))
        {
            var participant = await _participantService.GetByAccessCode(request.CreatedByAccessCode);

            if (participant == null)
            {
                return BadRequest(string.Format(ApiReturnMessages.ParticipantWithAccessCodeDoesNotExist, request.CreatedByAccessCode));
            }

            if (participant.DisputeGuid != disputeGuid)
            {
                return BadRequest(ApiReturnMessages.NotAssociatedToDispute);
            }
        }

        if (request.CreatedById.HasValue && string.IsNullOrEmpty(request.CreatedByAccessCode))
        {
            var participant = await _participantService.GetAsync(request.CreatedById.Value);
            request.CreatedByAccessCode = participant.AccessCode;
        }
        else if (!request.CreatedById.HasValue)
        {
            var participant = await _participantService.GetByAccessCode(request.CreatedByAccessCode);
            request.CreatedById = participant.ParticipantId;
        }

        DisputeSetContext(disputeGuid);
        var result = await _filePackageService.CreateAsync(disputeGuid, request);
        EntityIdSetContext(result.FilePackageId);
        return Ok(result);
    }

    [HttpPatch("{filePackageId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Patch(int filePackageId, [FromBody]JsonPatchDocumentExtension<FilePackagePatchRequest> filePackage)
    {
        if (CheckModified(_filePackageService, filePackageId))
        {
            return StatusConflicted();
        }

        var originalFilePackage = await _filePackageService.GetTrackingFilePackageAsync(filePackageId);
        if (originalFilePackage != null)
        {
            var filePackageToPatch = _mapper.Map<FilePackage, FilePackagePatchRequest>(originalFilePackage);
            filePackage.ApplyTo(filePackageToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await DisputeResolveAndSetContext(_filePackageService, filePackageId);
            _mapper.Map(filePackageToPatch, originalFilePackage);
            var result = await _filePackageService.PatchAsync(originalFilePackage);

            if (result != null)
            {
                EntityIdSetContext(filePackageId);
                return Ok(result);
            }
        }

        return NotFound();
    }

    [HttpDelete("{filePackageId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Delete(int filePackageId)
    {
        if (CheckModified(_filePackageService, filePackageId))
        {
            return StatusConflicted();
        }

        await DisputeResolveAndSetContext(_filePackageService, filePackageId);
        var result = await _filePackageService.DeleteAsync(filePackageId);
        if (result)
        {
            EntityIdSetContext(filePackageId);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }

    [HttpGet("{filePackageId:int}")]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Get(int filePackageId)
    {
        var filePackage = await _filePackageService.GetByIdAsync(filePackageId);
        if (filePackage != null)
        {
            return Ok(filePackage);
        }

        return NotFound();
    }

    [HttpGet("/api/disputefilepackages/{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser })]
    public async Task<IActionResult> GetByDisputeGuid(Guid disputeGuid, int count, int index)
    {
        var notes = await _filePackageService.GetByDisputeGuidAsync(disputeGuid, count, index);
        if (notes != null)
        {
            return Ok(notes);
        }

        return NotFound();
    }
}