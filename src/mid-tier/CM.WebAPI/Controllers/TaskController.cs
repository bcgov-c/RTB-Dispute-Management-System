using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Task;
using CM.Business.Services.DisputeServices;
using CM.Business.Services.Task;
using CM.Business.Services.UserServices;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;
using CmModel = CM.Data.Model;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/task")]
public class TaskController : BaseController
{
    private readonly IDisputeService _disputeService;
    private readonly IMapper _mapper;
    private readonly ITaskService _taskService;
    private readonly IUserService _userService;

    public TaskController(ITaskService taskService, IDisputeService disputeService, IUserService userService, IMapper mapper)
    {
        _taskService = taskService;
        _disputeService = disputeService;
        _userService = userService;
        _mapper = mapper;
    }

    [HttpPost("{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedAccessCode, RoleNames.OfficePay })]
    public async Task<IActionResult> Post(Guid disputeGuid, [FromBody]TaskRequest task)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (task.TaskOwnerId.HasValue)
        {
            var isOwnerActiveAdmin = await _userService.UserIsActiveAdmin(task.TaskOwnerId.Value);
            if (!isOwnerActiveAdmin)
            {
                return BadRequest(ApiReturnMessages.TaskOwnerInvalidRole);
            }
        }

        var errorMessage = await _taskService.ValidateTaskLinkedId(task.TaskLinkedTo, task.TaskLinkId, disputeGuid);
        if (errorMessage != string.Empty)
        {
            return BadRequest(errorMessage);
        }

        DisputeSetContext(disputeGuid);
        var newTask = await _taskService.CreateAsync(disputeGuid, task);
        EntityIdSetContext(newTask.TaskId);
        return Ok(newTask);
    }

    [HttpPatch("{taskId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> Patch(int taskId, [FromBody]JsonPatchDocumentExtension<TaskRequest> task)
    {
        if (CheckModified(_taskService, taskId))
        {
            return StatusConflicted();
        }

        var originalTask = await _taskService.GetNoTrackingTaskAsync(taskId);
        if (originalTask != null)
        {
            var taskToPatch = _mapper.Map<CmModel.Task, TaskRequest>(originalTask);
            task.ApplyTo(taskToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (originalTask.TaskStatus != 1)
            {
                var(exists, taskOwnerId) = task.GetValue<int?>("/task_owner_id");
                if (exists)
                {
                    var now = DateTime.UtcNow;

                    if (originalTask.TaskOwnerId.HasValue)
                    {
                        if (taskOwnerId.HasValue && originalTask.TaskOwnerId != taskOwnerId)
                        {
                            taskToPatch.LastOwnerAssignedDate = now;
                        }
                    }
                    else
                    {
                        if (taskOwnerId != null)
                        {
                            taskToPatch.LastOwnerAssignedDate = now;
                        }
                    }

                    if (originalTask.TaskOwnerId.HasValue && !taskOwnerId.HasValue && originalTask.ModifiedDate.HasValue)
                    {
                        taskToPatch.AssignedDurationSeconds += (int)DateTime.UtcNow.Subtract(originalTask.ModifiedDate.Value).TotalSeconds;
                        taskToPatch.LastUnassignedDate = DateTime.UtcNow;
                    }
                    else if (originalTask.TaskOwnerId.HasValue && originalTask.TaskOwnerId != taskOwnerId.GetValueOrDefault() && originalTask.ModifiedDate.HasValue)
                    {
                        taskToPatch.AssignedDurationSeconds += (int)DateTime.UtcNow.Subtract(originalTask.ModifiedDate.Value).TotalSeconds;
                        taskToPatch.LastOwnerId = originalTask.TaskOwnerId;
                    }
                    else if (!originalTask.TaskOwnerId.HasValue && taskOwnerId.HasValue && originalTask.ModifiedDate.HasValue)
                    {
                        taskToPatch.UnassignedDurationSeconds += (int)DateTime.UtcNow.Subtract(originalTask.ModifiedDate.Value).TotalSeconds;
                        taskToPatch.LastOwnerId = taskOwnerId;
                        taskToPatch.LastAssignedDate = DateTime.UtcNow;
                    }
                    else if (!originalTask.TaskOwnerId.HasValue && !taskOwnerId.HasValue && originalTask.ModifiedDate.HasValue)
                    {
                        taskToPatch.UnassignedDurationSeconds += (int)DateTime.UtcNow.Subtract(originalTask.ModifiedDate.Value).TotalSeconds;
                    }
                }
                else
                {
                    if (originalTask.TaskOwnerId.HasValue && originalTask.ModifiedDate.HasValue)
                    {
                        taskToPatch.AssignedDurationSeconds += (int)DateTime.UtcNow.Subtract(originalTask.ModifiedDate.Value).TotalSeconds;
                    }
                }
            }

            _mapper.Map(taskToPatch, originalTask);

            if (originalTask.TaskOwnerId.HasValue)
            {
                var isOwnerActiveAdmin = await _userService.UserIsActiveAdmin(originalTask.TaskOwnerId.Value);
                if (!isOwnerActiveAdmin)
                {
                    return BadRequest(ApiReturnMessages.TaskOwnerInvalidRole);
                }
            }

            var errorMessage = await _taskService.ValidateTaskLinkedId(originalTask.TaskLinkedTo, originalTask.TaskLinkId, originalTask.DisputeGuid);
            if (errorMessage != string.Empty)
            {
                return BadRequest(errorMessage);
            }

            await DisputeResolveAndSetContext(_taskService, taskId);
            var patchResult = await _taskService.PatchAsync(originalTask);

            if (patchResult != null)
            {
                var dispute = await _disputeService.GetDisputeNoTrackAsync(patchResult.DisputeGuid);
                var response = _mapper.Map<CmModel.Task, TaskResponse>(patchResult);
                response.FileNumber = dispute.FileNumber;
                EntityIdSetContext(taskId);
                return Ok(response);
            }
        }

        return NotFound();
    }

    [HttpDelete("{taskId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> Delete(int taskId)
    {
        if (CheckModified(_taskService, taskId))
        {
            return StatusConflicted();
        }

        await DisputeResolveAndSetContext(_taskService, taskId);
        var result = await _taskService.DeleteAsync(taskId);
        if (result)
        {
            EntityIdSetContext(taskId);
            return Ok(ApiReturnMessages.Deleted);
        }

        return NotFound();
    }

    [HttpGet("{taskId:int}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> Get(int taskId)
    {
        var task = await _taskService.GetTask(taskId);
        if (task != null)
        {
            return Ok(task);
        }

        return NotFound();
    }

    [HttpGet("/api/disputetasks/{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> GetDisputeTasks(Guid disputeGuid, int count, int index, [FromQuery]TasksFilterRequest tasksFilterCriteria)
    {
        var disputeTasks = await _taskService.GetDisputeTasks(disputeGuid, tasksFilterCriteria, count, index);
        if (disputeTasks != null)
        {
            return Ok(disputeTasks);
        }

        return NotFound();
    }

    [HttpGet("/api/ownertasks/{taskOwnerId:int}")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> GetOwnerTasks(int taskOwnerId, int count, int index, [FromQuery]TasksFilterRequest tasksFilterCriteria)
    {
        var disputeTasks = await _taskService.GetOwnerTasks(taskOwnerId, tasksFilterCriteria, count, index);
        if (disputeTasks != null)
        {
            return Ok(disputeTasks);
        }

        return NotFound();
    }

    [HttpGet("/api/unassignedtasks")]
    [AuthorizationRequired(new[] { RoleNames.Admin })]
    public async Task<IActionResult> GetUnassignedTasks(int count, int index, [FromQuery]TasksFilterRequest tasksFilterCriteria)
    {
        var disputeTasks = await _taskService.GetUnassignedTasks(tasksFilterCriteria, count, index);
        if (disputeTasks != null)
        {
            return Ok(disputeTasks);
        }

        return NotFound();
    }
}