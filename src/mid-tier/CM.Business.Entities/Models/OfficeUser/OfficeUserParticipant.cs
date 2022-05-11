using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OfficeUser;

public class OfficeUserParticipant
{
    [JsonProperty("participant_id")]
    public int ParticipantId { get; set; }

    [JsonProperty("group_participant_role")]
    public byte GroupParticipantRole { get; set; }

    [JsonProperty("access_code_hint")]
    public string AccessCode { get; set; }

    [JsonProperty("group_primary_contact_id")]
    public int? GroupPrimaryContactId { get; set; }

    [JsonProperty("name_abbreviation")]
    public string NameAbbreviation { get; set; }

    [JsonProperty("accepted_tou_date")]
    public string AcceptedTouDate { get; set; }

    [JsonProperty("accepted_tou")]
    public bool AcceptedTou { get; set; }

    [JsonProperty("primary_contact_method")]
    public byte PrimaryContactMethod { get; set; }

    [JsonProperty("secondary_contact_method")]
    public byte SecondaryContactMethod { get; set; }

    [JsonProperty("modified_date")]
    public string ModifiedDate { get; set; }
}

public class OfficeUserGetDisputeParticipant : OfficeUserParticipant
{
    [JsonProperty("primary_phone_hint")]
    public string PrimaryPhone { get; set; }

    [JsonProperty("email_address_hint")]
    public string Email { get; set; }

    [JsonProperty("participant_type")]
    public byte? ParticipantType { get; set; }

    [JsonProperty("participant_status")]
    public byte ParticipantStatus { get; set; }

    [JsonProperty("package_delivery_method")]
    public byte? PackageDeliveryMethod { get; set; }
}

public class OfficeUserPostDisputeParticipantResponse
{
    [JsonProperty("participant_id")]
    public int ParticipantId { get; set; }

    [JsonProperty("group_participant_role")]
    public byte GroupParticipantRole { get; set; }

    [JsonProperty("access_code")]
    public string AccessCode { get; set; }

    [JsonProperty("group_primary_contact_id")]
    public int? GroupPrimaryContactId { get; set; }

    [JsonProperty("name_abbreviation")]
    public string NameAbbreviation { get; set; }

    [JsonProperty("accepted_tou")]
    public bool AcceptedTou { get; set; }

    [JsonProperty("accepted_tou_date")]
    public string AcceptedTouDate { get; set; }

    [JsonProperty("created_date")]
    public string CreatedDate { get; set; }

    [JsonProperty("modified_date")]
    public string ModifiedDate { get; set; }
}