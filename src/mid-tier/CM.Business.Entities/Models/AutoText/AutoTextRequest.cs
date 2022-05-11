using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.AutoText;

public class AutoTextRequest
{
    [StringLength(255)]
    [Required]
    [JsonProperty("text_title")]
    public string TextTitle { get; set; }

    [JsonProperty("text_sub_type")]
    public byte? TextSubType { get; set; }

    [JsonProperty("text_status")]
    public byte? TextStatus { get; set; }

    [JsonProperty("text_privacy")]
    public byte? TextPrivacy { get; set; }

    [JsonProperty("text_owner")]
    public int? TextOwner { get; set; }

    [JsonProperty("text_content")]
    public string TextContent { get; set; }
}

public class AutoTextPostRequest : AutoTextRequest
{
    [JsonProperty("text_type")]
    public byte TextType { get; set; }
}

public class AutoTextPatchRequest : AutoTextRequest
{
}