using System.Collections.Generic;
using CM.Business.Entities.Models.Base;
using CM.Business.Entities.Models.InternalUserRole;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.User;

public class UserResponse : CommonResponse
{
    [JsonProperty("user_id")]
    public int SystemUserId { get; set; }

    [JsonProperty("user_name")]
    public string Username { get; set; }

    [JsonProperty("name")]
    public string FullName { get; set; }

    [JsonProperty("email")]
    public string AccountEmail { get; set; }

    [JsonProperty("mobile")]
    public string AccountMobile { get; set; }

    [JsonProperty("role_id")]
    public int SystemUserRoleId { get; set; }

    [JsonProperty("user_admin")]
    public byte AdminAccess { get; set; }

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

    [JsonProperty("internal_user_roles")]
    public ICollection<InternalUserRoleResponse> InternalUserRoles { get; set; }
}