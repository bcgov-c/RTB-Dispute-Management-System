using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.User;

public class UserLoginPatchRequest
{
    [JsonIgnore]
    public int SystemUserRoleId { get; set; }

    [JsonIgnore]
    public byte AdminAccess { get; set; }

    [JsonProperty("accepts_text_messages")]
    public bool AcceptsTextMessages { get; set; }

    [JsonProperty("account_email")]
    [DataType(DataType.EmailAddress)]
    [StringLength(100)]
    public string AccountEmail { get; set; }

    [JsonProperty("account_mobile")]
    [StringLength(15)]
    public string AccountMobile { get; set; }

    [JsonProperty("full_name")]
    [StringLength(100)]
    public string FullName { get; set; }

    [JsonProperty("schedule_manager")]
    public bool SchedulerManager { get; set; }

    [JsonProperty("is_active")]
    public bool IsActive { get; set; }

    [JsonProperty("scheduler")]
    public bool Scheduler { get; set; }

    [JsonProperty("service_office_id")]
    public int? ServiceOfficeId { get; set; }

    [JsonProperty("dashboard_access")]
    public bool DashboardAccess { get; set; }
}