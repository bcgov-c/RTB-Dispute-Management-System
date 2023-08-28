using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.OutcomeDocRequest;
using CM.Business.Services.DisputeServices;
using CM.Business.Services.OutcomeDocRequest;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Route("api/outcomedocrequests/outcomedocrequest")]
[Produces(Application.Json)]
public class OutcomeDocRequestController : BaseController
{
    private readonly IDisputeService _disputeService;
    private readonly IMapper _mapper;
    private readonly IOutcomeDocRequestService _outcomeDocRequestService;

    public OutcomeDocRequestController(IOutcomeDocRequestService outcomeDocRequestService, IDisputeService disputeService, IMapper mapper)
    {
        _outcomeDocRequestService = outcomeDocRequestService;
        _disputeService = disputeService;
        _mapper = mapper;
    }

    [HttpPost("{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser, RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> Post(Guid disputeGuid, [FromBody] OutcomeDocRequestRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var disputeExist = await _disputeService.DisputeExistsAsync(disputeGuid);
        if (!disputeExist)
        {
            return BadRequest(string.Format(ApiReturnMessages.DisputeDoesNotExist, disputeGuid));
        }

        var isActiveSubmitter = await _outcomeDocRequestService.IsActiveSubmitter(disputeGuid, request.SubmitterId);
        if (!isActiveSubmitter)
        {
            return BadRequest(ApiReturnMessages.InvalidSubmitter);
        }

        if (request.FileDescriptionId.HasValue)
        {
            var isActiveFileDescription = await _outcomeDocRequestService.IsActiveFileDescription(disputeGuid, request.FileDescriptionId.Value);
            if (!isActiveFileDescription)
            {
                return BadRequest(ApiReturnMessages.InvalidFileDescription);
            }
        }

        if (request.OutcomeDocGroupId.HasValue)
        {
            var isActiveOutcomeDocGroup = await _outcomeDocRequestService.IsActiveOutcomeDocGroup(disputeGuid, request.OutcomeDocGroupId.Value);
            if (!isActiveOutcomeDocGroup)
            {
                return BadRequest(ApiReturnMessages.InvalidOutcomeDocGroup);
            }
        }

        if (Convert.ToDateTime(request.DateDocumentsReceived.GetValueOrDefault()) >= DateTime.UtcNow)
        {
            return BadRequest(ApiReturnMessages.NotPastDate);
        }

        DisputeSetContext(disputeGuid);
        var result = await _outcomeDocRequestService.CreateAsync(disputeGuid, request);
        EntityIdSetContext(result.OutcomeDocRequestId);
        return Ok(result);
    }

    [HttpPatch("{outcomeDocRequestId:int}")]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited })]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Patch(int outcomeDocRequestId, [FromBody] JsonPatchDocumentExtension<OutcomeDocRequestPatchRequest> request)
    {
        if (CheckModified(_outcomeDocRequestService, outcomeDocRequestId))
        {
            return StatusConflicted();
        }

        var originalOutcomeDocRequest = await _outcomeDocRequestService.GetNoTrackingOutcomeDocRequestAsync(outcomeDocRequestId);
        if (originalOutcomeDocRequest != null)
        {
            var outcomeDocRequestToPatch = _mapper.Map<OutcomeDocRequest, OutcomeDocRequestPatchRequest>(originalOutcomeDocRequest);
            request.ApplyTo(outcomeDocRequestToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var(dateExists, dateDocReceived) = request.GetValue<string>("/date_documents_received");
            if (dateExists && (dateDocReceived == null || Convert.ToDateTime(dateDocReceived) >= DateTime.UtcNow))
            {
                return BadRequest(ApiReturnMessages.NotPastDate);
            }

            var(submitterExists, submitter) = request.GetValue<int>("/submitter_id");
            if (submitterExists)
            {
                var isActiveSubmitter = await _outcomeDocRequestService.IsActiveSubmitter(originalOutcomeDocRequest.DisputeGuid, submitter);
                if (!isActiveSubmitter)
                {
                    return BadRequest(ApiReturnMessages.InvalidSubmitter);
                }
            }

            var(docGroupIdExists, docGroupId) = request.GetValue<int?>("/outcome_doc_group_id");
            if (docGroupIdExists && docGroupId.HasValue)
            {
                var isActiveOutcomeDocGroup = await _outcomeDocRequestService.IsActiveOutcomeDocGroup(originalOutcomeDocRequest.DisputeGuid, docGroupId.Value);
                if (!isActiveOutcomeDocGroup)
                {
                    return BadRequest(ApiReturnMessages.InvalidOutcomeDocGroup);
                }
            }

            var(fileDescIdExists, fileDescId) = request.GetValue<int>("/file_description_id");
            if (fileDescIdExists)
            {
                var isActiveFileDescription = await _outcomeDocRequestService.IsActiveFileDescription(originalOutcomeDocRequest.DisputeGuid, fileDescId);
                if (!isActiveFileDescription)
                {
                    return BadRequest(ApiReturnMessages.InvalidFileDescription);
                }
            }

            await DisputeResolveAndSetContext(_outcomeDocRequestService, outcomeDocRequestId);
            _mapper.Map(outcomeDocRequestToPatch, originalOutcomeDocRequest);
            var result = await _outcomeDocRequestService.PatchAsync(originalOutcomeDocRequest);

            if (result != null)
            {
                EntityIdSetContext(outcomeDocRequestId);
                return Ok(_mapper.Map<OutcomeDocRequest, OutcomeDocRequestResponse>(result));
            }
        }

        return NotFound();
    }

    [HttpDelete("{outcomeDocRequestId:int}")]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited })]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Delete(int outcomeDocRequestId)
    {
        if (CheckModified(_outcomeDocRequestService, outcomeDocRequestId))
        {
            return StatusConflicted();
        }

        await DisputeResolveAndSetContext(_outcomeDocRequestService, outcomeDocRequestId);

        var isAnyOutcomeDocReqItems = await _outcomeDocRequestService.IsAnyOutcomeDocReqItems(outcomeDocRequestId);

        if (isAnyOutcomeDocReqItems)
        {
            return BadRequest(ApiReturnMessages.OutcomeDocReqItemsExists);
        }

        var result = await _outcomeDocRequestService.DeleteAsync(outcomeDocRequestId);
        if (result)
        {
            EntityIdSetContext(outcomeDocRequestId);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }

    [HttpGet("{outcomeDocRequestId:int}")]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited })]
    public async Task<IActionResult> GetById(int outcomeDocRequestId)
    {
        var outcomeDocRequest = await _outcomeDocRequestService.GetByIdAsync(outcomeDocRequestId);
        if (outcomeDocRequest != null)
        {
            return Ok(outcomeDocRequest);
        }

        return NotFound();
    }

    [HttpGet("/api/outcomedocrequests/outcomedocrequests/{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> GetByDispute(Guid disputeGuid)
    {
        var outcomeDocRequests = await _outcomeDocRequestService.GetByDispute(disputeGuid);
        if (outcomeDocRequests != null)
        {
            return Ok(outcomeDocRequests);
        }

        return NotFound();
    }

    [HttpGet("/api/outcomedocrequests/externaloutcomedocrequests/{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser, RoleNames.OfficePay })]
    public async Task<IActionResult> GetExternalOutcomeDocRequests(Guid disputeGuid)
    {
        var externalOutcomeDocRequests = await _outcomeDocRequestService.GetExternalOutcomeDocRequests(disputeGuid);
        if (externalOutcomeDocRequests != null)
        {
            return Ok(externalOutcomeDocRequests);
        }

        return NotFound();
    }
}