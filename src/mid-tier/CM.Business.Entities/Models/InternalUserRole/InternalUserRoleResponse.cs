using CM.Business.Entities.Models.Base;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.InternalUserRole;

public class InternalUserRoleResponse : CommonResponse
{
    [JsonProperty("internal_user_role_id")]
    public int InternalUserRoleId { get; set; }

    [JsonProperty("role_group_id")]
    public int RoleGroupId { get; set; }

    [JsonProperty("role_subtype_id")]
    public byte? RoleSubtypeId { get; set; }

    [JsonProperty("is_active")]
    public bool? IsActive { get; set; }

    [JsonProperty("engagement_type")]
    public EngagementType EngagementType { get; set; }

    [JsonProperty("schedule_status")]
    public ScheduleStatus? ScheduleStatus { get; set; }

    [JsonProperty("schedule_sub_status")]
    public ScheduleSubStatus? ScheduleSubStatus { get; set; }

    [JsonProperty("managed_by_id")]
    public int? ManagedById { get; set; }

    [JsonProperty("access_types")]
    public byte? AccessTypes { get; set; }

    [JsonProperty("access_sub_types")]
    public byte? AccessSubTypes { get; set; }

    [JsonProperty("role_note")]
    public string RoleNote { get; set; }
}