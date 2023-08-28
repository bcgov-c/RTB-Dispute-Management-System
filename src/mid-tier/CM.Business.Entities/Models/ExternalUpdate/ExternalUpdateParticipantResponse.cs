using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ExternalUpdate;

public class ExternalUpdateParticipantResponse
{
    [JsonProperty("participant_id")]
    public int ParticipantId { get; set; }

    [JsonProperty("group_participant_id")]
    public int GroupParticipantId { get; set; }

    [JsonProperty("group_participant_role")]
    public int GroupParticipantRole { get; set; }

    [JsonProperty("accepted_tou")]
    public bool AcceptedTou { get; set; }

    [JsonProperty("accepted_tou_date")]
    public string AcceptedTouDate { get; set; }

    [JsonProperty("email_hint")]
    public string Email { get; set; }

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

    [JsonProperty("modified_date")]
    public string ModifiedDate { get; set; }

    [JsonProperty("address_is_validated")]
    public bool AddressIsValidated { get; set; }

    [JsonProperty("mail_address_is_validated")]
    public bool MailAddressIsValidated { get; set; }
}