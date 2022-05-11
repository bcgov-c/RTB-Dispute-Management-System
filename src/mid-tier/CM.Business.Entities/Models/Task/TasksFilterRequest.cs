using System;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Task;

public class TasksFilterRequest
{
    [JsonProperty("tasks_created_after_date")]
    public DateTime? TasksCreatedAfterDate { get; set; }

    [JsonProperty("tasks_created_before_date")]
    public DateTime? TasksCreatedBeforeDate { get; set; }

    [JsonProperty("restrict_task_status")]
    public int? RestrictTaskStatus { get; set; }

    [JsonProperty("tasks_sub_type")]
    public int? TaskSubType { get; set; }

    [JsonProperty("sort_by_field")]
    public TaskSortField? SortByField { get; set; }

    [JsonProperty("sort_direction")]
    public SortDir SortDirection { get; set; }

    [JsonProperty("task_activity_type_list")]
    public int[] RestrictTaskActivityTypeList { get; set; }
}