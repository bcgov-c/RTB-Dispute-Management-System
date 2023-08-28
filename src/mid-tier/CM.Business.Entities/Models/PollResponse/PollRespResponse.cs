namespace CM.Business.Entities.Models.PollResponse;

using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

public class PollRespResponse : CommonResponse
{
    [JsonProperty("poll_response_id")]
    public int PollResponseId { get; set; }

    [JsonProperty("poll_id")]
    public int PollId { get; set; }

    [JsonProperty("dispute_guid")]
    public Guid DisputeGuid { get; set; }

    [JsonProperty("participant_id")]
    public int? ParticipantId { get; set; }

    [JsonProperty("response_type")]
    public byte? ResponseType { get; set; }

    [JsonProperty("response_sub_type")]
    public byte? ResponseSubType { get; set; }

    [JsonProperty("response_status")]
    public byte ResponseStatus { get; set; }

    [JsonProperty("response_site")]
    public byte? ResponseSite { get; set; }

    [JsonProperty("response_json")]
    [Required]
    [Column(TypeName = "json")]
    public string ResponseJson { get; set; }

    [JsonProperty("response_date")]
    public string ResponseDate { get; set; }

    [JsonProperty("response_text")]
    [StringLength(2000)]
    public string ResponseText { get; set; }

    [JsonProperty("associated_file_id")]
    public int? AssociatedFileId { get; set; }
}
