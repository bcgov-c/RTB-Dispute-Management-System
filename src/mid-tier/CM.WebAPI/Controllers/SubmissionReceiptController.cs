using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.SubmissionReceipt;
using CM.Business.Services.DisputeServices;
using CM.Business.Services.Parties;
using CM.Business.Services.SubmissionReceipt;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using CM.WebAPI.WebApiHelpers;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
public class SubmissionReceiptController : BaseController
{
    private readonly IDisputeService _disputeService;
    private readonly IMapper _mapper;
    private readonly IParticipantService _participantService;
    private readonly ISubmissionReceiptService _submissionReceiptService;

    public SubmissionReceiptController(IMapper mapper, IDisputeService disputeService, IParticipantService participantService, ISubmissionReceiptService submissionReceiptService)
    {
        _submissionReceiptService = submissionReceiptService;
        _disputeService = disputeService;
        _participantService = participantService;
        _mapper = mapper;
    }

    [HttpPost("api/submissionreceipt/{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser, RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> Post(Guid disputeGuid, [FromBody] SubmissionReceiptPostRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var disputeExists = await _disputeService.DisputeExistsAsync(disputeGuid);
        if (!disputeExists)
        {
            return BadRequest(string.Format(ApiReturnMessages.DisputeDoesNotExist, disputeGuid));
        }

        var participant = await _participantService.GetByIdAsync(request.ParticipantId);
        if (participant == null || participant.DisputeGuid != disputeGuid ||
            participant.ParticipantStatus is (byte)ParticipantStatus.Deleted or (byte)ParticipantStatus.Removed)
        {
            return BadRequest(ApiReturnMessages.InvalidParticipantOnDispute);
        }

        DisputeSetContext(disputeGuid);
        var newSubmissionReceipt = await _submissionReceiptService.CreateAsync(disputeGuid, request);
        EntityIdSetContext(newSubmissionReceipt.SubmissionReceiptId);
        return Ok(newSubmissionReceipt);
    }

    [ApplyConcurrencyCheck]
    [HttpPatch("api/submissionreceipt/{submissionReceiptId:int}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> Patch(int submissionReceiptId, [FromBody] JsonPatchDocumentExtension<SubmissionReceiptPatchRequest> request)
    {
        if (CheckModified(_submissionReceiptService, submissionReceiptId))
        {
            return StatusConflicted();
        }

        var originalSubmissionReceipt = await _submissionReceiptService.GetById(submissionReceiptId);
        if (originalSubmissionReceipt != null)
        {
            var submissionReceiptToPatch = _mapper.Map<Data.Model.SubmissionReceipt, SubmissionReceiptPatchRequest>(originalSubmissionReceipt);
            request.ApplyTo(submissionReceiptToPatch);

            TryValidateModel(submissionReceiptToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await DisputeResolveAndSetContext(_submissionReceiptService, submissionReceiptId);
            var result = await _submissionReceiptService.PatchAsync(submissionReceiptId, submissionReceiptToPatch);

            if (result != null)
            {
                EntityIdSetContext(submissionReceiptId);
                return Ok(result);
            }
        }

        return NotFound();
    }

    [HttpDelete("api/submissionreceipt/{submissionReceiptId:int}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Delete(int submissionReceiptId)
    {
        await DisputeResolveAndSetContext(_submissionReceiptService, submissionReceiptId);
        if (CheckModified(_submissionReceiptService, submissionReceiptId))
        {
            return StatusConflicted();
        }

        await DisputeResolveAndSetContext(_submissionReceiptService, submissionReceiptId);
        var result = await _submissionReceiptService.DeleteAsync(submissionReceiptId);
        if (result)
        {
            EntityIdSetContext(submissionReceiptId);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }

    [HttpGet("api/submissionreceipt/{submissionReceiptId:int}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> Get(int submissionReceiptId)
    {
        var submissionReceipt = await _submissionReceiptService.GetAsync(submissionReceiptId);
        if (submissionReceipt != null)
        {
            return Ok(submissionReceipt);
        }

        return NotFound();
    }

    [HttpGet("api/submissionreceipts/{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> GetByDisputeGuid(Guid disputeGuid)
    {
        var submissionReceiptList = await _submissionReceiptService.GetList(disputeGuid);
        return Ok(submissionReceiptList);
    }
}