using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.SchedulePeriod;
using CM.Business.Services.SchedulePeriod;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/schedulemanager")]
public class SchedulePeriodController : BaseController
{
    private readonly IMapper _mapper;
    private readonly ISchedulePeriodService _schedulePeriodService;

    public SchedulePeriodController(ISchedulePeriodService schedulePeriodService, IMapper mapper)
    {
        _schedulePeriodService = schedulePeriodService;
        _mapper = mapper;
    }

    [HttpPost("newscheduleperiod")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> Post([FromBody] SchedulePeriodPostRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (request.PeriodTimeZone != CmTimeZone.PacificTime)
        {
            return BadRequest(ApiReturnMessages.InvalidTimeZone);
        }

        var newSchedulePeriod = await _schedulePeriodService.CreateAsync(request);
        EntityIdSetContext(newSchedulePeriod.SchedulePeriodId);

        return Ok(newSchedulePeriod);
    }

    [HttpPatch("scheduleperiod/{schedulePeriodId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> Patch(int schedulePeriodId, [FromBody]JsonPatchDocumentExtension<SchedulePeriodPatchRequest> request)
    {
        if (CheckModified(_schedulePeriodService, schedulePeriodId))
        {
            return StatusConflicted();
        }

        var originalPeriod = await _schedulePeriodService.GetNoTrackingSchedulePeriodAsync(schedulePeriodId);
        if (originalPeriod != null)
        {
            var periodToPatch = _mapper.Map<Data.Model.SchedulePeriod, SchedulePeriodPatchRequest>(originalPeriod);
            request.ApplyTo(periodToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _mapper.Map(periodToPatch, originalPeriod);
            var result = await _schedulePeriodService.PatchAsync(originalPeriod);

            if (result != null)
            {
                EntityIdSetContext(schedulePeriodId);
                return Ok(_mapper.Map<Data.Model.SchedulePeriod, SchedulePeriodPostResponse>(result));
            }
        }

        return NotFound();
    }

    [HttpGet("scheduleperiod/{schedulePeriodId:int}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> GetById(int schedulePeriodId)
    {
        var period = await _schedulePeriodService.GetByIdAsync(schedulePeriodId);
        if (period != null)
        {
            return Ok(period);
        }

        return NotFound();
    }

    [HttpGet("scheduleperiod")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> Get(SchedulePeriodGetRequest request, int count, int index)
    {
        if (request.BetweenSchedulePeriodId is { Length: > 1 })
        {
            var firstId = request.BetweenSchedulePeriodId[0];
            var secondId = request.BetweenSchedulePeriodId[1];

            if (firstId >= secondId)
            {
                return BadRequest(ApiReturnMessages.IncorrectSchedulePeriodIdRange);
            }
        }

        var periods = await _schedulePeriodService.Get(request, count, index);
        if (periods != null)
        {
            return Ok(periods);
        }

        return NotFound();
    }
}