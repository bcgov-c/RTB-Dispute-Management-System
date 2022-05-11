using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Maintenance;

public class MaintenanceFullResponse
{
    [JsonProperty("total_available_records")]
    public int TotalAvailableRecords { get; set; }

    [JsonProperty("maintenance")]
    public ICollection<MaintenanceResponse> Maintenances { get; set; }
}

public class MaintenanceResponse
{
    [JsonProperty("maintenance_id")]
    public int MaintenanceId { get; set; }

    [JsonProperty("system_id")]
    public int SystemId { get; set; }

    [JsonProperty("maintenance_title")]
    public string MaintenanceTitle { get; set; }

    [JsonProperty("start_date_time")]
    public string StartDateTime { get; set; }

    [JsonProperty("expected_duration_minutes")]
    public int ExpectedDurationMinutes { get; set; }

    [JsonProperty("override_key")]
    public string OverrideKey { get; set; }
}