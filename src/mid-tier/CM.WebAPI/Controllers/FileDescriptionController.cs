using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Files;
using CM.Business.Services.Claims;
using CM.Business.Services.Files;
using CM.Business.Services.Parties;
using CM.Business.Services.RemedyServices;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/filedescription")]
public class FileDescriptionController : BaseController
{
    private readonly IClaimService _claimService;
    private readonly IFileDescriptionService _fileDescriptionService;
    private readonly IMapper _mapper;
    private readonly IParticipantService _participantService;
    private readonly IRemedyService _remedyService;

    public FileDescriptionController(IFileDescriptionService fileDescriptionService, IRemedyService remedyService, IClaimService claimService, IParticipantService participantService, IMapper mapper)
    {
        _fileDescriptionService = fileDescriptionService;
        _remedyService = remedyService;
        _claimService = claimService;
        _participantService = participantService;
        _mapper = mapper;
    }

    [HttpPost("/api/filedescription/{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser, RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> Post(Guid disputeGuid, [FromBody]FileDescriptionRequest fileDescription)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (fileDescription.ClaimId != null)
        {
            if (!await _claimService.ClaimExists((int)fileDescription.ClaimId))
            {
                return BadRequest(string.Format(ApiReturnMessages.ClaimDoesNotExist, fileDescription.ClaimId));
            }
        }

        if (fileDescription.RemedyId != null)
        {
            if (!await _remedyService.RemedyExists((int)fileDescription.RemedyId))
            {
                return BadRequest(string.Format(ApiReturnMessages.RemedyDoesNotExist, fileDescription.RemedyId));
            }
        }

        if (fileDescription.DescriptionBy != null)
        {
            if (!await _participantService.ParticipantExists((int)fileDescription.DescriptionBy))
            {
                return BadRequest(string.Format(ApiReturnMessages.ParticipantDoesNotExist, fileDescription.DescriptionBy));
            }
        }

        DisputeSetContext(disputeGuid);
        var newFileDescription = await _fileDescriptionService.CreateAsync(disputeGuid, fileDescription);
        EntityIdSetContext(newFileDescription.FileDescriptionId);
        return Ok(newFileDescription);
    }

    [HttpDelete("{fileDescriptionId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser, RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> Delete(int fileDescriptionId)
    {
        if (CheckModified(_fileDescriptionService, fileDescriptionId))
        {
            return StatusConflicted();
        }

        await DisputeResolveAndSetContext(_fileDescriptionService, fileDescriptionId);
        var result = await _fileDescriptionService.DeleteAsync(fileDescriptionId);
        if (result)
        {
            EntityIdSetContext(fileDescriptionId);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }

    [HttpPatch("{fileDescriptionId:int}")]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser, RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> Patch(int fileDescriptionId, [FromBody]JsonPatchDocumentExtension<FileDescriptionRequest> fileDescription)
    {
        if (CheckModified(_fileDescriptionService, fileDescriptionId))
        {
            return StatusConflicted();
        }

        var originalFileDescription = await _fileDescriptionService.GetTrackingFileDescriptionAsync(fileDescriptionId);
        if (originalFileDescription != null)
        {
            var fileDescriptionToPatch = _mapper.Map<FileDescription, FileDescriptionRequest>(originalFileDescription);

            fileDescription.ApplyTo(fileDescriptionToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var claimId = fileDescription.GetValue<int>("/claim_id");
            if (claimId.Exists && !await _claimService.ClaimExists(claimId.Value))
            {
                return BadRequest(string.Format(ApiReturnMessages.ClaimDoesNotExist, claimId.Value));
            }

            var remedyId = fileDescription.GetValue<int>("/remedy_id");
            if (remedyId.Exists && !await _remedyService.RemedyExists(remedyId.Value))
            {
                return BadRequest(string.Format(ApiReturnMessages.RemedyDoesNotExist, remedyId.Value));
            }

            var participantId = fileDescription.GetValue<int>("/description_by");
            if (participantId.Exists && !await _participantService.ParticipantExists(participantId.Value))
            {
                return BadRequest(string.Format(ApiReturnMessages.ParticipantDoesNotExist, participantId.Value));
            }

            await DisputeResolveAndSetContext(_fileDescriptionService, fileDescriptionId);
            _mapper.Map(fileDescriptionToPatch, originalFileDescription);
            var result = await _fileDescriptionService.PatchAsync(fileDescriptionId, originalFileDescription);

            if (result != null)
            {
                EntityIdSetContext(fileDescriptionId);
                return Ok(_mapper.Map<FileDescription, FileDescriptionResponse>(result));
            }
        }

        return NotFound();
    }

    [HttpGet("{fileDescriptionId:int}")]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> GetById(int fileDescriptionId)
    {
        var fileDescription = await _fileDescriptionService.GetAsync(fileDescriptionId);
        if (fileDescription != null)
        {
            return Ok(fileDescription);
        }

        return NotFound();
    }

    [HttpGet("/api/disputefiledescriptions/{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser })]
    public async Task<IActionResult> GetByDisputeGuid(Guid disputeGuid, int count, int index)
    {
        var fileDescriptionList = await _fileDescriptionService.GetDisputeFileDescriptionAsync(disputeGuid, count, index);
        return Ok(fileDescriptionList);
    }
}