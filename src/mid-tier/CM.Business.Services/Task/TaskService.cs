using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Task;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;
using TaskStatus = CM.Common.Utilities.TaskStatus;

namespace CM.Business.Services.Task;

public class TaskService : CmServiceBase, ITaskService
{
    public TaskService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<Guid> ResolveDisputeGuid(int id)
    {
        var entity = await UnitOfWork.TaskRepository.GetNoTrackingByIdAsync(c => c.TaskId == id);
        return entity?.DisputeGuid ?? Guid.Empty;
    }

    public async Task<bool> ValidateOwnerRole(int? taskOwnerId)
    {
        if (taskOwnerId.HasValue)
        {
            var user = await UnitOfWork.SystemUserRepository.GetByIdAsync(taskOwnerId.Value);
            return user.SystemUserRoleId == (int)Roles.StaffUser;
        }

        return true;
    }

    public async Task<TaskResponse> CreateAsync(Guid disputeGuid, TaskRequest task)
    {
        var now = DateTime.UtcNow;
        var newTask = MapperService.Map<TaskRequest, Data.Model.Task>(task);
        newTask.IsDeleted = false;
        newTask.DisputeGuid = disputeGuid;
        newTask.Dispute = await UnitOfWork.DisputeRepository.GetDisputeByGuidAsync(disputeGuid);

        if (newTask.TaskStatus == (byte)TaskStatus.Complete)
        {
            newTask.DateTaskCompleted = now;
        }

        if (!newTask.TaskOwnerId.HasValue)
        {
            newTask.LastUnassignedDate = now;
        }
        else
        {
            newTask.LastAssignedDate = now;
            newTask.LastOwnerId = newTask.TaskOwnerId;
            newTask.LastOwnerAssignedDate = now;
        }

        var taskResult = await UnitOfWork.TaskRepository.InsertAsync(newTask);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<Data.Model.Task, TaskResponse>(taskResult);
        }

        return null;
    }

    public async Task<bool> DeleteAsync(int taskId)
    {
        var task = await UnitOfWork.TaskRepository.GetByIdAsync(taskId);
        if (task != null)
        {
            task.IsDeleted = true;
            UnitOfWork.TaskRepository.Attach(task);
            var result = await UnitOfWork.Complete();
            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<TaskFullResponse> GetDisputeTasks(Guid disputeGuid, TasksFilterRequest criteria, int count, int index)
    {
        if (count == 0)
        {
            count = int.MaxValue;
        }

        var taskResponse = new TaskFullResponse();

        var disputeTasks = await UnitOfWork.TaskRepository.GetDisputeTasks(disputeGuid, criteria);
        if (disputeTasks != null)
        {
            taskResponse.TotalAvailableRecords = disputeTasks.Count;
            taskResponse.Tasks.AddRange(MapperService.Map<List<Data.Model.Task>, List<TaskResponse>>(disputeTasks.AsQueryable().ApplyPaging(count, index).ToList()));
        }

        return taskResponse;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        var lastModifiedDate = await UnitOfWork.TaskRepository.GetLastModifiedDate((int)id);

        return lastModifiedDate;
    }

    public async Task<Data.Model.Task> GetNoTrackingTaskAsync(int taskId)
    {
        var task = await UnitOfWork.TaskRepository.GetNoTrackingByIdAsync(
            c => c.TaskId == taskId);
        return task;
    }

    public async Task<TaskFullResponse> GetOwnerTasks(int taskOwnerId, TasksFilterRequest criteria, int count, int index)
    {
        if (count == 0)
        {
            count = Pagination.DefaultPageSize;
        }

        var taskResponse = new TaskFullResponse();

        var ownerTasks = await UnitOfWork.TaskRepository.GetOwnerTasks(taskOwnerId, criteria);
        if (ownerTasks != null)
        {
            taskResponse.TotalAvailableRecords = ownerTasks.Count;
            taskResponse.Tasks.AddRange(MapperService.Map<List<Data.Model.Task>, List<TaskResponse>>(ownerTasks.AsQueryable().ApplyPaging(count, index).ToList()));
        }

        return taskResponse;
    }

    public async Task<TaskResponse> GetTask(int taskId)
    {
        var task = await UnitOfWork.TaskRepository.GetTaskWithDispute(taskId);
        if (task != null)
        {
            return MapperService.Map<Data.Model.Task, TaskResponse>(task);
        }

        return null;
    }

    public async Task<Data.Model.Task> PatchAsync(Data.Model.Task task)
    {
        task.DateTaskCompleted = task.TaskStatus switch
        {
            (byte)TaskStatus.Complete => DateTime.UtcNow,
            (byte)TaskStatus.Incomplete => null,
            _ => task.DateTaskCompleted
        };

        UnitOfWork.TaskRepository.Attach(task);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return task;
        }

        return null;
    }

    public async Task<string> ValidateTaskLinkedId(byte taskLinkedTo, int? taskLinkId, Guid disputeGuid)
    {
        if (taskLinkedTo > 0)
        {
            if (!taskLinkId.HasValue)
            {
                return ApiReturnMessages.TaskLinkedIdRequired;
            }

            switch (taskLinkedTo)
            {
                case 1:
                    var email = await UnitOfWork.EmailMessageRepository.GetEmailByIdAndDispute(taskLinkId.Value, disputeGuid);
                    if (email == null)
                    {
                        return string.Format(ApiReturnMessages.EmailMessageNotFound, taskLinkedTo);
                    }

                    break;
            }
        }

        return string.Empty;
    }

    public async Task<TaskFullResponse> GetUnassignedTasks(TasksFilterRequest criteria, int count, int index)
    {
        if (count == 0)
        {
            count = Pagination.DefaultPageSize;
        }

        var taskResponse = new TaskFullResponse();

        var ownerTasks = await UnitOfWork.TaskRepository.GetUnassignedTasks(criteria);
        if (ownerTasks != null)
        {
            taskResponse.TotalAvailableRecords = ownerTasks.Count;
            taskResponse.Tasks.AddRange(MapperService.Map<List<Data.Model.Task>, List<TaskResponse>>(ownerTasks.AsQueryable().ApplyPaging(count, index).ToList()));
        }

        return taskResponse;
    }
}