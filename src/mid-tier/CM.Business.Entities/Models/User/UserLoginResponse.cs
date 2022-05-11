using System;
using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.User;

public class UserLoginResponse : CommonResponse
{
    [JsonProperty("system_user_id")]
    public int SystemUserId { get; set; }

    [JsonProperty("accepts_text_messages")]
    public bool? AcceptsTextMessages { get; set; }

    [JsonProperty("account_email")]
    public string AccountEmail { get; set; }

    [JsonProperty("account_mobile")]
    public string AccountMobile { get; set; }

    [JsonProperty("admin_access")]
    public bool AdminAccess { get; set; }

    [JsonProperty("full_name")]
    public string FullName { get; set; }

    [JsonProperty("schedule_manager")]
    public bool SchedulerManager { get; set; }

    [JsonProperty("is_active")]
    public bool? IsActive { get; set; }

    [JsonProperty("scheduler")]
    public bool Scheduler { get; set; }

    [JsonProperty("service_office_id")]
    public int? ServiceOfficeId { get; set; }

    [JsonProperty("system_user_role_id")]
    public int SystemUserRoleId { get; set; }

    [JsonProperty("user_guid")]
    public Guid UserGuid { get; set; }

    [JsonProperty("username")]
    public string Username { get; set; }

    [JsonProperty("dashboard_access")]
    public bool DashboardAccess { get; set; }
}