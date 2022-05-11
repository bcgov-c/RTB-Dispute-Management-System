using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Search;

public class ParticipantSearchRequest : SearchRequestBaseWithFilters
{
    [JsonProperty("business_name")]
    [MinLength(3)]
    public string BusinessName { get; set; }

    [JsonProperty("all_first_name")]
    [MinLength(2)]
    public string AllFirstName { get; set; }

    [JsonProperty("all_last_name")]
    [MinLength(2)]
    public string AllLastName { get; set; }

    [JsonProperty("all_phone")]
    public string AllPhone { get; set; }

    [JsonProperty("email")]
    public string Email { get; set; }

    [JsonProperty("creation_method")]
    public byte? CreationMethod { get; set; }
}