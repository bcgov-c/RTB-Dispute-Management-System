using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.ScheduleRequest;
using CM.Business.Services.ScheduleRequest;
using CM.Business.Services.UserServices;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using CM.WebAPI.WebApiHelpers;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/schedulemanager")]
public class ScheduleRequestController : BaseController
{
    private readonly IMapper _mapper;
    private readonly IScheduleRequestService _scheduleRequestService;
    private readonly IUserService _userService;

    public ScheduleRequestController(IScheduleRequestService scheduleRequestService,
        IUserService userService,
        IMapper mapper)
    {
        _scheduleRequestService = scheduleRequestService;
        _userService = userService;
        _mapper = mapper;
    }

    [HttpPost("schedulerequest/newschedulerequest")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> Post([FromBody] ScheduleRequestPostRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var validSubmitter = await _userService.UserIsActiveAdmin(request.RequestSubmitter);
        if (!validSubmitter)
        {
            return BadRequest(ApiReturnMessages.InvalidRequestSubmitter);
        }

        if (request.RequestType == 0)
        {
            return BadRequest(ApiReturnMessages.InvalidRequestType);
        }

        if (request.RequestOwnerId.HasValue)
        {
            var validRequestOwner = await _userService.UserIsActiveAdmin(request.RequestOwnerId.Value);
            if (!validRequestOwner)
            {
                return BadRequest(ApiReturnMessages.InvalidRequestOwner);
            }
        }

        if (Convert.ToDateTime(request.RequestStart) <= DateTime.UtcNow)
        {
            return BadRequest(ApiReturnMessages.PastRequestStart);
        }

        if (request.RequestStart >= request.RequestEnd)
        {
            return BadRequest(ApiReturnMessages.InvalidRequestStartEnd);
        }

        var userId = GetLoggedInUserId();
        var newScheduleRequest = await _scheduleRequestService.CreateAsync(request, userId);
        EntityIdSetContext(newScheduleRequest.ScheduleRequestId);

        return Ok(newScheduleRequest);
    }

    [HttpPatch("schedulerequest/{scheduleRequestId:int}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Patch(int scheduleRequestId, [FromBody] JsonPatchDocumentExtension<ScheduleRequestPatchRequest> request)
    {
        if (CheckModified(_scheduleRequestService, scheduleRequestId))
        {
            return StatusConflicted();
        }

        var originalRequest = await _scheduleRequestService.GetNoTrackingScheduleRequestAsync(scheduleRequestId);
        if (originalRequest != null)
        {
            var(existsRequestOwner, requestOwnerValue) = request.GetValue<int>("/request_owner");
            if (existsRequestOwner)
            {
                var validRequestOwner = await _userService.UserIsActiveAdmin(requestOwnerValue);
                if (!validRequestOwner)
                {
                    return BadRequest(ApiReturnMessages.InvalidRequestOwner);
                }
            }

            var requestToPatch = _mapper.Map<Data.Model.ScheduleRequest, ScheduleRequestPatchRequest>(originalRequest);
            request.ApplyTo(requestToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _mapper.Map(requestToPatch, originalRequest);
            var result = await _scheduleRequestService.PatchAsync(originalRequest);

            if (result != null)
            {
                EntityIdSetContext(scheduleRequestId);
                return Ok(_mapper.Map<Data.Model.ScheduleRequest, ScheduleRequestPatchResponse>(result));
            }
        }

        return NotFound();
    }

    [HttpDelete("schedulerequest/{scheduleRequestId:int}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Delete(int scheduleRequestId)
    {
        if (CheckModified(_scheduleRequestService, scheduleRequestId))
        {
            return StatusConflicted();
        }

        var scheduleRequest = await _scheduleRequestService.GetNoTrackingScheduleRequestAsync(scheduleRequestId);
        if (scheduleRequest != null && scheduleRequest.RequestEnd <= DateTime.UtcNow)
        {
            return BadRequest(ApiReturnMessages.RestrictDeletePastScheduleRequest);
        }

        var result = await _scheduleRequestService.DeleteAsync(scheduleRequestId);
        if (result)
        {
            EntityIdSetContext(scheduleRequestId);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }

    [HttpGet("schedulerequest/{scheduleRequestId:int}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> GetById(int scheduleRequestId)
    {
        var scheduleRequest = await _scheduleRequestService.GetByIdAsync(scheduleRequestId);
        if (scheduleRequest != null)
        {
            return Ok(scheduleRequest);
        }

        return NotFound();
    }

    [HttpGet("schedulerequest")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> GetScheduleRequests(ScheduleRequestsGetRequest request, int count, int index)
    {
        var scheduleRequests = await _scheduleRequestService.GetScheduleRequests(request, count, index);
        if (scheduleRequests != null)
        {
            return Ok(scheduleRequests);
        }

        return NotFound();
    }
}