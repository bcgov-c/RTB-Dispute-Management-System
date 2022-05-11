using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Files;
using CM.Business.Services.Files;
using CM.Business.Services.Parties;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.WebAPI.Filters;
using CM.WebAPI.WebApiHelpers;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/fileinfo")]
public class FileInfoController : BaseController
{
    private readonly IFileService _fileService;
    private readonly IMapper _mapper;
    private readonly IParticipantService _participantService;

    public FileInfoController(IFileService fileService, IParticipantService participantService, IMapper mapper)
    {
        _fileService = fileService;
        _participantService = participantService;
        _mapper = mapper;
    }

    [HttpGet("{fileId:int}")]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Get(int fileId)
    {
        var fileInfo = await _fileService.GetFileInfo(fileId);
        if (fileInfo != null)
        {
            return Ok(fileInfo);
        }

        return NotFound();
    }

    [HttpGet("/api/disputefiles/{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser })]
    public async Task<IActionResult> GetDisputeFiles(Guid disputeGuid, FileInfoGetRequest request)
    {
        var disputeFiles = await _fileService.GetDisputeFiles(disputeGuid, request);
        if (disputeFiles != null)
        {
            return Ok(disputeFiles);
        }

        return NotFound();
    }

    [HttpPatch("{fileId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Patch(int fileId, [FromBody]JsonPatchDocumentExtension<FileInfoPatchRequest> fileInfo)
    {
        if (CheckModified(_fileService, fileId))
        {
            return StatusConflicted();
        }

        var originalFile = await _fileService.GetNoTrackingFileAsync(fileId);
        if (originalFile != null)
        {
            var fileToPatch = _mapper.Map<File, FileInfoPatchRequest>(originalFile);
            fileInfo.ApplyTo(fileToPatch);

            if (FileUtils.GetFileExtension(originalFile.FileName) != FileUtils.GetFileExtension(fileToPatch.FileName))
            {
                return StatusConflicted(ApiReturnMessages.FileExtensionDifferent);
            }

            if (fileToPatch.AddedBy != null)
            {
                var isAddedByParticipant = await _fileService.CheckAddedBy(fileId, fileToPatch.AddedBy.Value);
                if (!isAddedByParticipant)
                {
                    return StatusConflicted(string.Format(ApiReturnMessages.AddedByNotParticipant, fileToPatch.AddedBy.Value));
                }
            }

            await TryUpdateModelAsync(fileToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var participantId = fileInfo.GetValue<int>("/added_by");
            if (participantId.Exists && !await _participantService.ParticipantExists(participantId.Value))
            {
                return BadRequest(string.Format(ApiReturnMessages.ParticipantDoesNotExist, participantId.Value));
            }

            await DisputeResolveAndSetContext(_fileService, fileId);
            _mapper.Map(fileToPatch, originalFile);
            originalFile.FileId = fileId;
            var result = await _fileService.PatchFileInfo(originalFile);
            EntityIdSetContext(fileId);
            return Ok(result);
        }

        return NotFound();
    }
}