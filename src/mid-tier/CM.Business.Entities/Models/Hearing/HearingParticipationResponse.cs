using System;
using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Hearing;

public class HearingParticipationResponse : CommonResponse
{
    [JsonProperty("hearing_participation_id")]
    public int HearingParticipationId { get; set; }

    [JsonProperty("hearing_id")]
    public int HearingId { get; set; }

    [JsonProperty("participant_id")]
    public int? ParticipantId { get; set; }

    [JsonProperty("dispute_guid")]
    public Guid DisputeGuid { get; set; }

    [JsonProperty("other_participant_name")]
    public string OtherParticipantName { get; set; }

    [JsonProperty("other_participant_title")]
    public string OtherParticipantTitle { get; set; }

    [JsonProperty("other_participant_association")]
    public byte? OtherParticipantAssociation { get; set; }

    [JsonProperty("name_abbreviation")]
    public string NameAbbreviation { get; set; }

    [JsonProperty("participation_status")]
    public byte? ParticipationStatus { get; set; }

    [JsonProperty("participation_comment")]
    public string ParticipationComment { get; set; }

    [JsonProperty("pre_participation_status")]
    public byte? PreParticipationStatus { get; set; }

    [JsonProperty("pre_participation_comment")]
    public string PreParticipationComment { get; set; }
}