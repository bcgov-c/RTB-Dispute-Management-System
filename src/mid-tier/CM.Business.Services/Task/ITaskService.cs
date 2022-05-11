using System;
using System.Threading.Tasks;
using CM.Business.Entities.Models.Task;
using CM.Business.Services.Base;

namespace CM.Business.Services.Task;

public interface ITaskService : IServiceBase, IDisputeResolver
{
    Task<TaskResponse> CreateAsync(Guid disputeGuid, TaskRequest task);

    Task<Data.Model.Task> GetNoTrackingTaskAsync(int taskId);

    Task<Data.Model.Task> PatchAsync(Data.Model.Task task);

    Task<bool> DeleteAsync(int taskId);

    Task<TaskResponse> GetTask(int taskId);

    Task<TaskFullResponse> GetDisputeTasks(Guid disputeGuid, TasksFilterRequest criteria, int count, int index);

    Task<TaskFullResponse> GetOwnerTasks(int taskOwnerId, TasksFilterRequest criteria, int count, int index);

    Task<bool> ValidateOwnerRole(int? taskOwnerId);

    Task<string> ValidateTaskLinkedId(byte taskLinkedTo, int? taskLinkId, Guid disputeGuid);

    Task<TaskFullResponse> GetUnassignedTasks(TasksFilterRequest criteria, int count, int index);
}