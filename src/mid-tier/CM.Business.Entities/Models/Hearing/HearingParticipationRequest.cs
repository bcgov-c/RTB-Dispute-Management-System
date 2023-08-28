using System;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Hearing;

public class HearingParticipationRequest
{
    [JsonProperty("participant_id")]
    [Range(1, int.MaxValue)]
    public int? ParticipantId { get; set; }

    [JsonProperty("dispute_guid")]
    public Guid DisputeGuid { get; set; }

    [JsonProperty("other_participant_name")]
    [StringLength(255)]
    public string OtherParticipantName { get; set; }

    [JsonProperty("other_participant_title")]
    [StringLength(255)]
    public string OtherParticipantTitle { get; set; }

    [JsonProperty("other_participant_association")]
    public byte? OtherParticipantAssociation { get; set; }

    [JsonProperty("participation_status")]
    public byte? ParticipationStatus { get; set; }

    [JsonProperty("participation_comment")]
    [StringLength(500)]
    public string ParticipationComment { get; set; }

    [JsonProperty("pre_participation_status")]
    public byte? PreParticipationStatus { get; set; }

    [JsonProperty("pre_participation_comment")]
    [StringLength(1000)]
    public string PreParticipationComment { get; set; }

    [JsonProperty("participation_status_by")]
    public int? ParticipationStatusBy { get; set; }

    [JsonProperty("pre_participation_status_by")]
    public int? PreParticipationStatusBy { get; set; }

    [JsonProperty("pre_participation_status_date")]
    public DateTime? PreParticipationStatusDate { get; set; }
}