using System;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.AccessCode;

public class DisputeAccessParticipant
{
    [JsonProperty("participant_id")]
    public int ParticipantId { get; set; }

    [JsonProperty("participant_type")]
    public byte? ParticipantType { get; set; }

    [JsonProperty("participant_status")]
    public int ParticipantStatus { get; set; }

    [JsonProperty("group_participant_role")]
    public byte GroupParticipantRole { get; set; }

    [JsonProperty("group_primary_contact_id")]
    public int? GroupPrimaryContactId { get; set; }

    [JsonProperty("accepted_tou")]
    public bool AcceptedTou { get; set; }

    [JsonProperty("accepted_tou_date")]
    public DateTime? AcceptedTouDate { get; set; }

    [JsonProperty("email_hint")]
    public string Email { get; set; }

    [JsonProperty("no_email")]
    public bool? NoEmail { get; set; }

    [JsonProperty("email_verified")]
    public bool? EmailVerified { get; set; }

    [JsonProperty("primary_phone_hint")]
    public string PrimaryPhone { get; set; }

    [JsonProperty("primary_phone_verified")]
    public bool? PrimaryPhoneVerified { get; set; }

    [JsonProperty("secondary_phone_hint")]
    public string SecondaryPhone { get; set; }

    [JsonProperty("secondary_phone_verified")]
    public bool? SecondaryPhoneVerified { get; set; }

    [JsonProperty("fax_hint")]
    public string Fax { get; set; }

    [JsonProperty("primary_contact_method")]
    public byte? PrimaryContactMethod { get; set; }

    [JsonProperty("secondary_contact_method")]
    public byte? SecondaryContactMethod { get; set; }

    [JsonProperty("name_abbreviation")]
    public string NameAbbreviation { get; set; }

    [JsonProperty("access_code_hint")]
    public string AccessCodeHint { get; set; }

    [JsonProperty("access_code")]
    public string AccessCode { get; set; }

    [JsonProperty("address_is_validated")]
    public bool AddressIsValidated { get; set; }

    [JsonProperty("mail_address_is_validated")]
    public bool MailAddressIsValidated { get; set; }

    [JsonProperty("is_party")]
    public bool? IsParty { get; set; }
}