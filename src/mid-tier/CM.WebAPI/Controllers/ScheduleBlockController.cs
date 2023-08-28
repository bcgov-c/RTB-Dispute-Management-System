using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.ScheduleBlock;
using CM.Business.Services.ScheduleBlock;
using CM.Business.Services.SchedulePeriod;
using CM.Business.Services.UserServices;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/schedulemanager")]
public class ScheduleBlockController : BaseController
{
    private readonly IMapper _mapper;
    private readonly IScheduleBlockService _scheduleBlockService;
    private readonly ISchedulePeriodService _schedulePeriodService;

    private readonly TimeSpan _time1 = TimeSpan.Parse("06:00");
    private readonly TimeSpan _time2 = TimeSpan.Parse("21:00");
    private readonly IUserService _userService;

    public ScheduleBlockController(IScheduleBlockService scheduleBlockService,
        ISchedulePeriodService schedulePeriodService,
        IUserService userService,
        IMapper mapper)
    {
        _scheduleBlockService = scheduleBlockService;
        _schedulePeriodService = schedulePeriodService;
        _userService = userService;
        _mapper = mapper;
    }

    [HttpPost("scheduledblock/{schedulePeriodId:int}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> Post(int schedulePeriodId, [FromBody] ScheduleBlockPostRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var schedulePeriod = await _schedulePeriodService.GetSchedulePeriod(schedulePeriodId);

        if (schedulePeriod == null)
        {
            return BadRequest(ApiReturnMessages.InvalidSchedulePeriod);
        }

        if (schedulePeriod.PeriodStatus == PeriodStatus.Inactive)
        {
            return BadRequest(ApiReturnMessages.InactiveSchedulePeriod);
        }

        var user = await _userService.UserIsActiveAdmin(request.SystemUserId);

        if (!user)
        {
            return BadRequest(ApiReturnMessages.InvalidActiveAdminUser);
        }

        if (request.BlockType is < BlockType.Vacation)
        {
            TimeZoneInfo.ClearCachedData();
            var timezone = TimeZoneInfo.FindSystemTimeZoneById("Pacific Standard Time");
            var dateTimeStartPst = TimeZoneInfo.ConvertTime(request.BlockStart, timezone);
            var dateTimeEndPst = TimeZoneInfo.ConvertTime(request.BlockEnd, timezone);

            if (!(dateTimeStartPst.TimeOfDay >= _time1
                  && dateTimeEndPst.TimeOfDay <= _time2
                  && dateTimeStartPst.Date == dateTimeEndPst.Date))
            {
                return BadRequest(ApiReturnMessages.ExceedWorkingDayBlock);
            }
        }

        if (request.BlockStart >= request.BlockEnd)
        {
            return BadRequest(ApiReturnMessages.BlockStartAfterEnd);
        }

        if (request.BlockStart < schedulePeriod.PeriodStart || request.BlockStart > schedulePeriod.PeriodEnd)
        {
            return BadRequest(ApiReturnMessages.ScheduleStartOutOfPeriod);
        }

        if (!(request.BlockStart.ToLocalTime().TimeOfDay >= _time1 && request.BlockStart.ToLocalTime().TimeOfDay <= _time2))
        {
            return BadRequest(ApiReturnMessages.InvalidStartLocalTimePeriod);
        }

        if (request.BlockEnd < schedulePeriod.PeriodStart || request.BlockEnd > schedulePeriod.PeriodEnd)
        {
            return BadRequest(ApiReturnMessages.ScheduleEndOutOfPeriod);
        }

        var duration = request.BlockEnd.Subtract(request.BlockStart);

        if (duration.TotalHours < 1)
        {
            return BadRequest(ApiReturnMessages.ShortScheduleBlockDuration);
        }

        var isScheduleBlockOverlapped = await _scheduleBlockService.IsBlockOverlapped(null, request.SystemUserId, request.BlockStart, request.BlockEnd);

        if (isScheduleBlockOverlapped)
        {
            return BadRequest(ApiReturnMessages.OverlappedBlockForUser);
        }

        var newScheduleBlock = await _scheduleBlockService.CreateAsync(schedulePeriodId, request);
        EntityIdSetContext(newScheduleBlock.ScheduleBlockId);

        return Ok(newScheduleBlock);
    }

    [HttpPatch("scheduledblock/{scheduleBlockId:int}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Patch(int scheduleBlockId, [FromBody] JsonPatchDocumentExtension<ScheduleBlockPatchRequest> request)
    {
        if (CheckModified(_scheduleBlockService, scheduleBlockId))
        {
            return StatusConflicted();
        }

        var originalBlock = await _scheduleBlockService.GetNoTrackingScheduleBlockAsync(scheduleBlockId);
        if (originalBlock != null)
        {
            var(existsBlockType, blockTypeValue) = request.GetValue<int>("/block_type");
            if (existsBlockType)
            {
                if (blockTypeValue < (int)BlockType.Vacation)
                {
                    TimeZoneInfo.ClearCachedData();
                    var timezone = TimeZoneInfo.FindSystemTimeZoneById("Pacific Standard Time");
                    var dateTimeStartPst = TimeZoneInfo.ConvertTime(originalBlock.BlockStart.GetCmDateTime(), timezone);
                    var dateTimeEndPst = TimeZoneInfo.ConvertTime(originalBlock.BlockEnd.GetCmDateTime(), timezone);

                    if (!(dateTimeStartPst.TimeOfDay >= _time1
                          && dateTimeEndPst.TimeOfDay <= _time2
                          && dateTimeStartPst.Date == dateTimeEndPst.Date))
                    {
                        return BadRequest(ApiReturnMessages.ExceedWorkingDayBlock);
                    }
                }
            }

            var(existsBlockStart, blockStartValue) = request.GetValue<string>("/block_start");
            var(existsBlockEnd, blockEndValue) = request.GetValue<string>("/block_end");

            if (existsBlockStart && existsBlockEnd)
            {
                if (Convert.ToDateTime(blockEndValue) <= Convert.ToDateTime(blockStartValue))
                {
                    return BadRequest(ApiReturnMessages.BlockStartAfterEnd);
                }
            }

            if (existsBlockStart)
            {
                if (Convert.ToDateTime(blockStartValue) < originalBlock.SchedulePeriod.PeriodStart || Convert.ToDateTime(blockStartValue) > originalBlock.SchedulePeriod.PeriodEnd)
                {
                    return BadRequest(ApiReturnMessages.ScheduleStartOutOfPeriod);
                }

                if (!(Convert.ToDateTime(blockStartValue).ToLocalTime().TimeOfDay >= _time1 && Convert.ToDateTime(blockStartValue).ToLocalTime().TimeOfDay <= _time2))
                {
                    return BadRequest(ApiReturnMessages.InvalidStartLocalTimePeriod);
                }
            }

            if (existsBlockEnd)
            {
                if (Convert.ToDateTime(blockEndValue) < originalBlock.SchedulePeriod.PeriodStart || Convert.ToDateTime(blockEndValue) > originalBlock.SchedulePeriod.PeriodEnd)
                {
                    return BadRequest(ApiReturnMessages.ScheduleEndOutOfPeriod);
                }

                if (!(Convert.ToDateTime(blockEndValue).ToLocalTime().TimeOfDay >= _time1 && Convert.ToDateTime(blockEndValue).ToLocalTime().TimeOfDay <= _time2))
                {
                    return BadRequest(ApiReturnMessages.InvalidEndLocalTimePeriod);
                }
            }

            if (originalBlock.SchedulePeriod.PeriodStatus == PeriodStatus.Inactive)
            {
                return BadRequest(ApiReturnMessages.InactiveSchedulePeriod);
            }

            var blockToPatch = _mapper.Map<Data.Model.ScheduleBlock, ScheduleBlockPatchRequest>(originalBlock);
            request.ApplyTo(blockToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _mapper.Map(blockToPatch, originalBlock);

            if (existsBlockStart || existsBlockEnd)
            {
                var duration = blockToPatch.BlockEnd.Subtract(blockToPatch.BlockStart);

                if (duration.TotalHours < 1)
                {
                    return BadRequest(ApiReturnMessages.ShortScheduleBlockDuration);
                }

                var isScheduleBlockOverlapped = await _scheduleBlockService.IsBlockOverlapped(scheduleBlockId, originalBlock.SystemUserId, blockToPatch.BlockStart, blockToPatch.BlockEnd);

                if (isScheduleBlockOverlapped)
                {
                    return BadRequest(ApiReturnMessages.OverlappedBlockForUser);
                }
            }

            var result = await _scheduleBlockService.PatchAsync(originalBlock);

            if (result != null)
            {
                EntityIdSetContext(scheduleBlockId);
                return Ok(result);
            }
        }

        return NotFound();
    }

    [HttpDelete("scheduledblock/{scheduleBlockId:int}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    [ApplyConcurrencyCheck]
    public async Task<IActionResult> Delete(int scheduleBlockId)
    {
        if (CheckModified(_scheduleBlockService, scheduleBlockId))
        {
            return StatusConflicted();
        }

        var scheduleBlock = await _scheduleBlockService.GetNoTrackingScheduleBlockAsync(scheduleBlockId);

        if (scheduleBlock.SchedulePeriod.PeriodStatus == PeriodStatus.Inactive)
        {
            return BadRequest(ApiReturnMessages.InactiveSchedulePeriod);
        }

        var result = await _scheduleBlockService.DeleteAsync(scheduleBlockId);
        if (result)
        {
            EntityIdSetContext(scheduleBlockId);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }

    [HttpGet("scheduledblock/{scheduleBlockId:int}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> GetById(int scheduleBlockId)
    {
        var scheduleBlock = await _scheduleBlockService.GetByIdAsync(scheduleBlockId);
        if (scheduleBlock != null)
        {
            return Ok(scheduleBlock);
        }

        return NotFound();
    }

    [HttpGet("scheduledblocks/{schedulePeriodId:int}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> GetByPeriodId(int schedulePeriodId)
    {
        var scheduleBlocks = await _scheduleBlockService.GetByPeriodId(schedulePeriodId);
        if (scheduleBlocks != null)
        {
            return Ok(scheduleBlocks);
        }

        return NotFound();
    }

    [HttpGet("scheduledblocks")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> GetByDateRange(ScheduleBlockGetByDateRangeRequest request, int count, int index)
    {
        if (request.BlockStartingBefore <= request.BlockStartingAfter)
        {
            return BadRequest(ApiReturnMessages.BlockStartingBeforeAfterInvalid);
        }

        if (request.SystemUserId.HasValue)
        {
            var isUserActiveAdmin = await _userService.UserIsActiveAdmin(request.SystemUserId.Value);
            if (!isUserActiveAdmin)
            {
                return BadRequest(ApiReturnMessages.InvalidActiveAdminUser);
            }
        }

        var scheduleBlocks = await _scheduleBlockService.GetByDateRange(request, count, index);
        if (scheduleBlocks != null)
        {
            return Ok(scheduleBlocks);
        }

        return NotFound();
    }
}