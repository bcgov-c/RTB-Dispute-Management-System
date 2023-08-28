using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.OutcomeDocument;
using CM.Business.Services.OutcomeDocument;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Route("api/outcomedoccontent")]
[Produces(Application.Json)]
[AuthorizationRequired(new[] { RoleNames.Admin })]
public class OutcomeDocContentController : BaseController
{
    private readonly IMapper _mapper;
    private readonly IOutcomeDocContentService _outcomeDocContentService;
    private readonly IOutcomeDocFileService _outcomeDocFileService;

    public OutcomeDocContentController(IOutcomeDocContentService outcomeDocContentService, IOutcomeDocFileService outcomeDocFileService, IMapper mapper)
    {
        _outcomeDocContentService = outcomeDocContentService;
        _outcomeDocFileService = outcomeDocFileService;
        _mapper = mapper;
    }

    [HttpPost("{outcomeDocFileId:int}")]
    public async Task<IActionResult> Post(int outcomeDocFileId, [FromBody]OutcomeDocContentPostRequest outcomeDocContent)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var outcomeDocFileExist = await _outcomeDocFileService.OutcomeDocFileExists(outcomeDocFileId);
        if (!outcomeDocFileExist)
        {
            return BadRequest(string.Format(ApiReturnMessages.OutcomeDocFileDoesNotExist, outcomeDocFileId));
        }

        await DisputeResolveAndSetContext(_outcomeDocFileService, outcomeDocFileId);
        var result = await _outcomeDocContentService.CreateAsync(outcomeDocFileId, outcomeDocContent);
        EntityIdSetContext(result.OutcomeDocContentId);
        return Ok(result);
    }

    [HttpPatch("{outcomeDocContentId:int}")]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Patch(int outcomeDocContentId, [FromBody]JsonPatchDocumentExtension<OutcomeDocContentPatchRequest> outcomeDocContent)
    {
        if (CheckModified(_outcomeDocContentService, outcomeDocContentId))
        {
            return StatusConflicted();
        }

        var originalOutcomeDocContent = await _outcomeDocContentService.GetNoTrackingOutcomeDocContentAsync(outcomeDocContentId);
        if (originalOutcomeDocContent != null)
        {
            var outcomeDocContentToPatch = _mapper.Map<OutcomeDocContent, OutcomeDocContentPatchRequest>(originalOutcomeDocContent);
            outcomeDocContent.ApplyTo(outcomeDocContentToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await DisputeResolveAndSetContext(_outcomeDocContentService, outcomeDocContentId);
            _mapper.Map(outcomeDocContentToPatch, originalOutcomeDocContent);
            var result = await _outcomeDocContentService.PatchAsync(originalOutcomeDocContent);

            if (result != null)
            {
                EntityIdSetContext(outcomeDocContentId);
                return Ok(_mapper.Map<OutcomeDocContent, OutcomeDocContentResponse>(result));
            }
        }

        return NotFound();
    }

    [HttpDelete("{outcomeDocumentContentId:int}")]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Delete(int outcomeDocumentContentId)
    {
        if (CheckModified(_outcomeDocContentService, outcomeDocumentContentId))
        {
            return StatusConflicted();
        }

        await DisputeResolveAndSetContext(_outcomeDocContentService, outcomeDocumentContentId);
        var result = await _outcomeDocContentService.DeleteAsync(outcomeDocumentContentId);
        if (result)
        {
            EntityIdSetContext(outcomeDocumentContentId);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }
}