using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.AutoText;

public class AutoTextResponse : CommonResponse
{
    [JsonProperty("auto_text_id")]
    public int AutoTextId { get; set; }

    [JsonProperty("text_title")]
    public string TextTitle { get; set; }

    [JsonProperty("text_type")]
    public byte TextType { get; set; }

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