using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.User;

public class PatchUserRequest
{
    [JsonProperty("is_active")]
    [Required]
    public bool IsActive { get; set; }
}