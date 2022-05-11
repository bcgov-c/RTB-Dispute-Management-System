using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.OutcomeDocument;
using CM.Business.Services.DisputeServices;
using CM.Business.Services.Files;
using CM.Business.Services.OutcomeDocument;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.WebAPI.Filters;
using CM.WebAPI.WebApiHelpers;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Route("api/outcomedocfile")]
[Produces(Application.Json)]
[AuthorizationRequired(new[] { RoleNames.Admin })]
public class OutcomeDocFileController : BaseController
{
    private readonly IDisputeService _disputeService;
    private readonly IFileService _fileService;
    private readonly IMapper _mapper;
    private readonly IOutcomeDocFileService _outcomeDocFileService;
    private readonly IOutcomeDocGroupService _outcomeDocGroupService;

    public OutcomeDocFileController(IOutcomeDocFileService outcomeDocFileService, IOutcomeDocGroupService outcomeDocGroupService, IDisputeService disputeService, IFileService fileService, IMapper mapper)
    {
        _outcomeDocFileService = outcomeDocFileService;
        _outcomeDocGroupService = outcomeDocGroupService;
        _disputeService = disputeService;
        _fileService = fileService;
        _mapper = mapper;
    }

    [HttpPost("{outcomeDocGroupId:int}")]
    public async Task<IActionResult> Post(int outcomeDocGroupId, [FromBody]OutcomeDocFilePostRequest outcomeDocFile)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var outcomeDocGroupExists = await _outcomeDocGroupService.OutcomeDocGroupExists(outcomeDocGroupId);
        if (!outcomeDocGroupExists)
        {
            return BadRequest(string.Format(ApiReturnMessages.OutcomeDocGroupDoesNotExist, outcomeDocGroupId));
        }

        var disputeExist = await _disputeService.DisputeExistsAsync(outcomeDocFile.DisputeGuid);
        if (!disputeExist)
        {
            return BadRequest(string.Format(ApiReturnMessages.DisputeDoesNotExist, outcomeDocFile.DisputeGuid));
        }

        if (outcomeDocFile.FileId != null)
        {
            var fileExists = await _fileService.FileExists((int)outcomeDocFile.FileId);
            if (!fileExists)
            {
                return BadRequest(string.Format(ApiReturnMessages.FileDoesNotExist, outcomeDocFile.FileId));
            }
        }

        await DisputeResolveAndSetContext(_outcomeDocGroupService, outcomeDocGroupId);
        var result = await _outcomeDocFileService.CreateAsync(outcomeDocGroupId, outcomeDocFile);
        EntityIdSetContext(result.OutcomeDocFileId);
        return Ok(result);
    }

    [HttpPatch("{outcomeDocFileId:int}")]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Patch(int outcomeDocFileId, [FromBody]JsonPatchDocumentExtension<OutcomeDocFilePatchRequest> outcomeDocFile)
    {
        if (CheckModified(_outcomeDocFileService, outcomeDocFileId))
        {
            return StatusConflicted();
        }

        var originalOutcomeDocFile = await _outcomeDocFileService.GetNoTrackingOutcomeDocFileAsync(outcomeDocFileId);
        if (originalOutcomeDocFile != null)
        {
            var outcomeDocFileToPatch = _mapper.Map<OutcomeDocFile, OutcomeDocFilePatchRequest>(originalOutcomeDocFile);
            outcomeDocFile.ApplyTo(outcomeDocFileToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var fileId = outcomeDocFile.GetValue<int?>("/file_id");
            if (fileId.Exists && fileId.Value.HasValue && !await _fileService.FileExists(fileId.Value.Value))
            {
                return BadRequest(string.Format(ApiReturnMessages.FileDoesNotExist, fileId.Value));
            }

            var createPostedDecision = false;
            var deletePostedDecision = false;
            var visibleToPublic = outcomeDocFile.GetValue<bool>("/visible_to_public");
            if (visibleToPublic.Exists)
            {
                if (originalOutcomeDocFile.VisibleToPublic == true && visibleToPublic.Value == false)
                {
                    deletePostedDecision = true;
                }

                if (originalOutcomeDocFile.VisibleToPublic == false && visibleToPublic.Value)
                {
                    createPostedDecision = true;
                }
            }

            await DisputeResolveAndSetContext(_outcomeDocFileService, outcomeDocFileId);
            _mapper.Map(outcomeDocFileToPatch, originalOutcomeDocFile);
            var result = await _outcomeDocFileService.PatchAsync(originalOutcomeDocFile, createPostedDecision, deletePostedDecision);

            if (result != null)
            {
                EntityIdSetContext(outcomeDocFileId);
                return Ok(_mapper.Map<OutcomeDocFile, OutcomeDocFileResponse>(result));
            }
        }

        return NotFound();
    }

    [HttpDelete("{outcomeDocFileId:int}")]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Delete(int outcomeDocFileId)
    {
        if (CheckModified(_outcomeDocFileService, outcomeDocFileId))
        {
            return StatusConflicted();
        }

        await DisputeResolveAndSetContext(_outcomeDocFileService, outcomeDocFileId);
        var result = await _outcomeDocFileService.DeleteAsync(outcomeDocFileId);
        if (result)
        {
            EntityIdSetContext(outcomeDocFileId);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }
}