using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.User;

public class UserLoginResetRequest
{
    [JsonProperty("password")]
    [StringLength(250, MinimumLength = 8)]
    [DataType(DataType.Password)]
    public string Password { get; set; }
}