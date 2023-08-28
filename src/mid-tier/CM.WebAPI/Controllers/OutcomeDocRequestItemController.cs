using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.OutcomeDocRequest;
using CM.Business.Services.OutcomeDocRequest;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Route("api/outcomedocrequests/outcomedocrequestitem")]
[Produces(Application.Json)]
public class OutcomeDocRequestItemController : BaseController
{
    private readonly IMapper _mapper;
    private readonly IOutcomeDocRequestItemService _outcomeDocRequestItemService;

    public OutcomeDocRequestItemController(IOutcomeDocRequestItemService outcomeDocRequestItemService, IMapper mapper)
    {
        _outcomeDocRequestItemService = outcomeDocRequestItemService;
        _mapper = mapper;
    }

    [HttpPost("{outcomeDocRequestId:int}")]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser, RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> Post(int outcomeDocRequestId, [FromBody] OutcomeDocRequestItemRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var outcomeDocRequestExist = await _outcomeDocRequestItemService.OutcomeDocRequestExists(outcomeDocRequestId);
        if (!outcomeDocRequestExist)
        {
            return BadRequest(ApiReturnMessages.InvalidOutcomeDocRequest);
        }

        if (request.FileDescriptionId.HasValue)
        {
            var isActiveFileDescription = await _outcomeDocRequestItemService.IsActiveFileDescription(outcomeDocRequestId, request.FileDescriptionId.Value);
            if (!isActiveFileDescription)
            {
                return BadRequest(ApiReturnMessages.InvalidFileDescription);
            }
        }

        var result = await _outcomeDocRequestItemService.CreateAsync(outcomeDocRequestId, request);
        EntityIdSetContext(result.OutcomeDocReqItemId);
        return Ok(result);
    }

    [HttpPatch("{outcomeDocReqItemId:int}")]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited })]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Patch(int outcomeDocReqItemId, [FromBody] JsonPatchDocumentExtension<OutcomeDocRequestItemPatchRequest> request)
    {
        if (CheckModified(_outcomeDocRequestItemService, outcomeDocReqItemId))
        {
            return StatusConflicted();
        }

        var originalOutcomeDocRequestItem = await _outcomeDocRequestItemService.GetNoTrackingOutcomeDocRequestItemAsync(outcomeDocReqItemId);
        if (originalOutcomeDocRequestItem != null)
        {
            var outcomeDocRequestItemToPatch = _mapper.Map<Data.Model.OutcomeDocReqItem, OutcomeDocRequestItemPatchRequest>(originalOutcomeDocRequestItem);
            request.ApplyTo(outcomeDocRequestItemToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await DisputeResolveAndSetContext(_outcomeDocRequestItemService, outcomeDocReqItemId);
            _mapper.Map(outcomeDocRequestItemToPatch, originalOutcomeDocRequestItem);
            var result = await _outcomeDocRequestItemService.PatchAsync(originalOutcomeDocRequestItem);

            if (result != null)
            {
                EntityIdSetContext(outcomeDocReqItemId);
                return Ok(_mapper.Map<Data.Model.OutcomeDocReqItem, OutcomeDocRequestItemResponse>(result));
            }
        }

        return NotFound();
    }

    [HttpDelete("{outcomeDocReqItemId:int}")]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited })]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Delete(int outcomeDocReqItemId)
    {
        if (CheckModified(_outcomeDocRequestItemService, outcomeDocReqItemId))
        {
            return StatusConflicted();
        }

        await DisputeResolveAndSetContext(_outcomeDocRequestItemService, outcomeDocReqItemId);

        var result = await _outcomeDocRequestItemService.DeleteAsync(outcomeDocReqItemId);
        if (result)
        {
            EntityIdSetContext(outcomeDocReqItemId);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }
}