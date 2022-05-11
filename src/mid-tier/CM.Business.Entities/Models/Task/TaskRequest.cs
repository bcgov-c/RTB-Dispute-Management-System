using System;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Task;

public class TaskRequest
{
    [JsonProperty("task_linked_to")]
    public byte TaskLinkedTo { get; set; }

    [JsonProperty("task_link_id")]
    public int? TaskLinkId { get; set; }

    [JsonProperty("task_type")]
    public byte? TaskType { get; set; }

    [JsonProperty("task_text")]
    [StringLength(1000, MinimumLength = 5)]
    [Required]
    public string TaskText { get; set; }

    [JsonProperty("task_priority")]
    public byte TaskPriority { get; set; }

    [JsonProperty("task_status")]
    public byte? TaskStatus { get; set; }

    [JsonProperty("task_owner_id")]
    public int? TaskOwnerId { get; set; }

    [JsonProperty("task_due_date")]
    public DateTime? TaskDueDate { get; set; }

    [JsonProperty("task_sub_type")]
    public byte? TaskSubType { get; set; }

    [JsonProperty("task_activity_type")]
    public byte? TaskActivityType { get; set; }

    [JsonIgnore]
    public DateTime? LastUnassignedDate { get; set; }

    [JsonIgnore]
    public DateTime? LastAssignedDate { get; set; }

    [JsonIgnore]
    public int? LastOwnerId { get; set; }

    [JsonIgnore]
    public int? AssignedDurationSeconds { get; set; }

    [JsonIgnore]
    public int? UnassignedDurationSeconds { get; set; }

    public DateTime? LastOwnerAssignedDate { get; set; }
}