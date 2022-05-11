using System;
using System.Linq;
using System.Threading.Tasks;
using CM.Business.Entities.Models.HearingReporting;
using CM.Business.Services.HearingReporting;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
public class HearingReportingController : ControllerBase
{
    private readonly IHearingReportingService _hearingReportingService;

    public HearingReportingController(IHearingReportingService hearingReportingService)
    {
        _hearingReportingService = hearingReportingService;
    }

    [HttpGet("/api/yearlyhearingsummary/{year:int}")]
    [AuthorizationRequired(new[] { RoleNames.ExtendedAdmin })]
    public async Task<IActionResult> GetYearlyHearingSummary(int year, HearingReportingRequest request)
    {
        if (request.Priorities == null || (request.Priorities != null && !request.Priorities.Any()))
        {
            return BadRequest(ApiReturnMessages.AtLeastOneHearingPriority);
        }

        var result = await _hearingReportingService.GetYearlyHearings(year, request);
        return Ok(result);
    }

    [HttpGet("/api/monthlyhearingsummary/{month:int}/{year:int}")]
    [AuthorizationRequired(new[] { RoleNames.ExtendedAdmin })]
    public async Task<IActionResult> GetMonthlyHearingSummary(int month, int year, HearingReportingRequest request)
    {
        if (request.Priorities == null || (request.Priorities != null && !request.Priorities.Any()))
        {
            return BadRequest(ApiReturnMessages.AtLeastOneHearingPriority);
        }

        var result = await _hearingReportingService.GetMonthlyHearings(month, year, request);
        return Ok(result);
    }

    [HttpGet("/api/dailyhearingdetail/{dateTime:DateTime}")]
    [AuthorizationRequired(new[] { RoleNames.ExtendedAdmin })]
    public async Task<IActionResult> GetDailyHearingDetail(DateTime dateTime)
    {
        var result = await _hearingReportingService.GetDailyHearingDetails(dateTime);
        return Ok(result);
    }

    [HttpGet("/api/ownerhearingdetail/{hearingOwnerId:int}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> GetOwnerHearingsDetail(int hearingOwnerId, OwnerHearingsDetailRequest request)
    {
        var ownerHearings = await _hearingReportingService.GetOwnerHearings(hearingOwnerId, request);
        if (ownerHearings != null)
        {
            return Ok(ownerHearings);
        }

        return NotFound();
    }

    [HttpGet("/api/availablehearings")]
    [AuthorizationRequired(new[] { RoleNames.ExtendedAdmin })]
    public async Task<IActionResult> GetAvailableHearings(AvailableHearingsRequest request, int index, int count)
    {
        var availableHearings = await _hearingReportingService.GetAvailableHearings(request, index, count);
        if (availableHearings != null)
        {
            return Ok(availableHearings);
        }

        return NotFound();
    }
}