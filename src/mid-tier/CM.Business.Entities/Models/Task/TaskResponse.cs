using System;
using System.Collections.Generic;
using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Task;

public class TaskResponse : CommonResponse
{
    [JsonProperty("task_id")]
    public int TaskId { get; set; }

    [JsonProperty("dispute_guid")]
    public Guid DisputeGuid { get; set; }

    [JsonProperty("file_number")]
    public int? FileNumber { get; set; }

    [JsonProperty("task_linked_to")]
    public byte TaskLinkedTo { get; set; }

    [JsonProperty("task_link_id")]
    public int? TaskLinkId { get; set; }

    [JsonProperty("task_type")]
    public byte TaskType { get; set; }

    [JsonProperty("task_text")]
    public string TaskText { get; set; }

    [JsonProperty("task_priority")]
    public byte TaskPriority { get; set; }

    [JsonProperty("task_status")]
    public byte? TaskStatus { get; set; }

    [JsonProperty("date_task_completed")]
    public string DateTaskCompleted { get; set; }

    [JsonProperty("task_owner_id")]
    public int? TaskOwnerId { get; set; }

    [JsonProperty("task_due_date")]
    public string TaskDueDate { get; set; }

    [JsonProperty("task_sub_type")]
    public byte? TaskSubType { get; set; }

    [JsonProperty("task_activity_type")]
    public byte? TaskActivityType { get; set; }

    [JsonProperty("last_unassigned_date")]
    public string LastUnassignedDate { get; set; }

    [JsonProperty("last_assigned_date")]
    public string LastAssignedDate { get; set; }

    [JsonProperty("last_owner_id")]
    public int? LastOwnerId { get; set; }

    [JsonProperty("assigned_duration_seconds")]
    public int? AssignedDurationSeconds { get; set; }

    [JsonProperty("unassigned_duration_seconds")]
    public int? UnassignedDurationSeconds { get; set; }

    [JsonProperty("last_owner_assigned_date")]
    public string LastOwnerAssignedDate { get; set; }
}

public class TaskFullResponse
{
    public TaskFullResponse()
    {
        Tasks = new List<TaskResponse>();
    }

    [JsonProperty("total_available_records")]
    public int TotalAvailableRecords { get; set; }

    [JsonProperty("results")]
    public List<TaskResponse> Tasks { get; set; }
}