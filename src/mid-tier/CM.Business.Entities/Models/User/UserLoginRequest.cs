using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.User;

public class UserLoginRequest
{
    [JsonProperty("accepts_text_messages")]
    public bool AcceptsTextMessages { get; set; }

    [JsonProperty("account_email")]
    [DataType(DataType.EmailAddress)]
    [StringLength(100)]
    public string AccountEmail { get; set; }

    [JsonProperty("account_mobile")]
    [StringLength(15)]
    public string AccountMobile { get; set; }

    [JsonProperty("admin_access")]
    [Required]
    public bool AdminAccess { get; set; }

    [JsonProperty("full_name")]
    [StringLength(100)]
    public string FullName { get; set; }

    [JsonProperty("schedule_manager")]
    public bool SchedulerManager { get; set; }

    [JsonProperty("is_active")]
    public bool IsActive { get; set; }

    [JsonProperty("password")]
    [StringLength(250, MinimumLength = 8)]
    [DataType(DataType.Password)]
    public string Password { get; set; }

    [JsonProperty("system_user_role_id")]
    [Required]
    public int SystemUserRoleId { get; set; }

    [JsonProperty("username")]
    [Required]
    public string Username { get; set; }

    [JsonProperty("scheduler")]
    public bool Scheduler { get; set; }

    [JsonProperty("service_office_id")]
    public int? ServiceOfficeId { get; set; }
}