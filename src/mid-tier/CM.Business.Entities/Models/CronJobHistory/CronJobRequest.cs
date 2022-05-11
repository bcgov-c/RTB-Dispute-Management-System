using System;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.CronJobHistory;

public class CronJobRequest
{
    [JsonProperty("job_name")]
    public string JobName { get; set; }

    [JsonProperty("job_start")]
    public DateTime JobStart { get; set; }

    [JsonProperty("job_run_time")]
    public TimeSpan JobRunTime { get; set; }

    [JsonProperty("job_result")]
    public bool JobResult { get; set; }
}