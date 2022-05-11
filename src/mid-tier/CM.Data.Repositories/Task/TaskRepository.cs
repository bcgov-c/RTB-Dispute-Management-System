using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Business.Entities.Models.Task;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;
using TaskStatus = CM.Common.Utilities.TaskStatus;

namespace CM.Data.Repositories.Task;

public class TaskRepository : CmRepository<Model.Task>, ITaskRepository
{
    public TaskRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<List<Model.Task>> GetDisputeTasks(Guid disputeGuid, TasksFilterRequest criteria)
    {
        var tasks = await Context.Tasks
            .Where(x => x.DisputeGuid == disputeGuid)
            .Include(d => d.Dispute)
            .ToListAsync();

        return GetFilteredTasks(tasks, criteria);
    }

    public async Task<DateTime?> GetLastModifiedDate(int id)
    {
        var dates = await Context.Tasks
            .Where(c => c.TaskId == id)
            .Select(d => d.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }

    public async Task<List<Model.Task>> GetOwnerTasks(int taskOwnerId, TasksFilterRequest criteria)
    {
        var tasks = await Context.Tasks.Where(x => x.TaskOwnerId.Equals(taskOwnerId)).Include(d => d.Dispute).ToListAsync();

        return GetFilteredTasks(tasks, criteria);
    }

    public async Task<Model.Task> GetTaskWithDispute(int taskId)
    {
        var task = await Context.Tasks.Include(d => d.Dispute).SingleOrDefaultAsync(x => x.TaskId.Equals(taskId));
        return task;
    }

    public async Task<List<Model.Task>> GetUnassignedTasks(TasksFilterRequest criteria)
    {
        var tasks = await Context.Tasks.Where(x => x.TaskStatus == (byte)TaskStatus.Incomplete && x.TaskOwnerId.HasValue == false)
            .Include(d => d.Dispute)
            .ToListAsync();

        return GetFilteredTasks(tasks, criteria);
    }

    private static List<Model.Task> GetFilteredTasks(List<Model.Task> tasks, TasksFilterRequest criteria)
    {
        if (criteria.TasksCreatedAfterDate.HasValue)
        {
            tasks = tasks.Where(x => x.CreatedDate > criteria.TasksCreatedAfterDate.Value).AsQueryable().ToList();
        }

        if (criteria.TasksCreatedBeforeDate.HasValue)
        {
            tasks = tasks.Where(x => x.CreatedDate < criteria.TasksCreatedBeforeDate.Value).AsQueryable().ToList();
        }

        if (criteria.RestrictTaskStatus.HasValue)
        {
            tasks = tasks.Where(x => x.TaskStatus == criteria.RestrictTaskStatus.Value).AsQueryable().ToList();
        }

        if (criteria.TaskSubType.HasValue)
        {
            tasks = tasks.Where(x => x.TaskSubType == criteria.TaskSubType.Value).AsQueryable().ToList();
        }

        if (criteria.RestrictTaskActivityTypeList is { Length: > 0 })
        {
            tasks = tasks.Where(x => x.TaskActivityType.HasValue && criteria.RestrictTaskActivityTypeList.Contains(x.TaskActivityType.Value)).AsQueryable().ToList();
        }

        switch (criteria.SortByField)
        {
            case TaskSortField.CreatedDate:
                tasks = tasks.OrderBy(x => x.CreatedDate).AsQueryable().ToList();

                break;
            case TaskSortField.TaskDueDate:
                tasks = tasks.OrderBy(x => !x.TaskDueDate.HasValue).ThenBy(x => x.TaskDueDate).AsQueryable().ToList();

                break;
            case TaskSortField.TaskOwnerId:
                tasks = tasks.OrderBy(x => x.TaskOwnerId).AsQueryable().ToList();

                break;
            case TaskSortField.TaskPriority:
                if (criteria.SortDirection == SortDir.Desc)
                {
                    tasks = tasks.OrderByDescending(x => x.TaskPriority).ThenBy(x => !x.TaskDueDate.HasValue).ThenBy(x => x.TaskDueDate).AsQueryable().ToList();
                }
                else
                {
                    tasks = tasks.OrderBy(x => x.TaskPriority).ThenBy(x => !x.TaskDueDate.HasValue).ThenBy(x => x.TaskDueDate).AsQueryable().ToList();
                }

                break;
            case TaskSortField.DateTaskCompleted:
                tasks = tasks.OrderBy(x => !x.DateTaskCompleted.HasValue).ThenBy(x => x.DateTaskCompleted).AsQueryable().ToList();

                break;
            default:
                tasks = tasks.OrderBy(x => x.CreatedDate).AsQueryable().ToList();

                break;
        }

        if (criteria.SortDirection == SortDir.Desc && criteria.SortByField != TaskSortField.TaskPriority && criteria.SortByField != TaskSortField.DateTaskCompleted)
        {
            tasks.Reverse();
        }

        if (criteria.SortByField == TaskSortField.DateTaskCompleted)
        {
            var upperTasks = tasks.Where(x => !x.DateTaskCompleted.HasValue).ToList();
            var bottomTasks = tasks.Except(upperTasks).ToList();

            if (criteria.SortDirection == SortDir.Desc)
            {
                bottomTasks.Reverse();
            }

            tasks = upperTasks.Union(bottomTasks).ToList();
        }

        return tasks.ToList();
    }
}