using Newtonsoft.Json;

namespace CM.Business.Entities.Models.AutoText;

public class AutoTextGetRequest
{
    [JsonProperty("text_type")]
    public byte? TextType { get; set; }

    [JsonProperty("text_owner")]
    public int? TextOwner { get; set; }
}