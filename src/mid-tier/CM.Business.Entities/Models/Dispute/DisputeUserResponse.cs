using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Dispute;

public class DisputeUserResponse
{
    [JsonProperty("user_id")]
    public int UserId { get; set; }

    [JsonProperty("user_name")]
    public string Username { get; set; }

    [JsonProperty("full_name")]
    public string FullName { get; set; }

    [JsonProperty("email")]
    public string Email { get; set; }

    [JsonProperty("role_id")]
    public int RoleId { get; set; }

    [JsonProperty("is_active")]
    public bool? IsActive { get; set; }

    [JsonProperty("created_date")]
    public string CreatedDate { get; set; }

    [JsonProperty("modified_date")]
    public string ModifiedDate { get; set; }
}