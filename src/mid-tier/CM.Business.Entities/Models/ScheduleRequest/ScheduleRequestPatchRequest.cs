using System.ComponentModel.DataAnnotations;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ScheduleRequest;

public class ScheduleRequestPatchRequest
{
    [JsonProperty("request_owner")]
    public int? RequestOwnerId { get; set; }

    [JsonProperty("request_type")]
    public byte RequestType { get; set; }

    [JsonProperty("request_status")]
    public ScheduleRequestStatus RequestStatus { get; set; }

    [JsonProperty("request_sub_status")]
    public ScheduleRequestSubStatus RequestSubStatus { get; set; }

    [JsonProperty("request_description")]
    [MaxLength(500)]
    public string RequestDescription { get; set; }

    [JsonProperty("request_note")]
    [StringLength(500)]
    public string RequestNote { get; set; }

    [JsonProperty("request_json")]
    [JsonValidation]
    public string RequestJson { get; set; }
}