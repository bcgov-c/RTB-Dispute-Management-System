using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.Task;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.Task;

public interface ITaskRepository : IRepository<Model.Task>
{
    Task<List<Model.Task>> GetDisputeTasks(Guid disputeGuid, TasksFilterRequest criteria);

    Task<DateTime?> GetLastModifiedDate(int id);

    Task<List<Model.Task>> GetOwnerTasks(int taskOwnerId, TasksFilterRequest criteria);

    Task<Model.Task> GetTaskWithDispute(int taskId);

    Task<List<Model.Task>> GetUnassignedTasks(TasksFilterRequest criteria);
}