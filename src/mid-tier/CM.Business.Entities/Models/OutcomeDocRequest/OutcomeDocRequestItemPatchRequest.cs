using System.ComponentModel.DataAnnotations;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OutcomeDocRequest;

public class OutcomeDocRequestItemPatchRequest
{
    [JsonProperty("item_type")]
    public OutcomeDocRequestItemType ItemType { get; set; }

    [JsonProperty("item_sub_type")]
    public OutcomeDocRequestItemSubType? ItemSubType { get; set; }

    [JsonProperty("item_status")]
    public byte ItemStatus { get; set; }

    [JsonProperty("item_title")]
    [StringLength(70)]
    public string ItemTitle { get; set; }

    [JsonProperty("item_description")]
    [StringLength(1000)]
    public string ItemDescription { get; set; }

    [JsonProperty("file_description_id")]
    public int FileDescriptionId { get; set; }

    [JsonProperty("item_note")]
    [StringLength(500)]
    public string ItemNote { get; set; }
}