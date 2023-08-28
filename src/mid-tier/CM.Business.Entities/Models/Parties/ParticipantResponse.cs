using System;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Parties;

public class ParticipantResponse : ParticipantEntity
{
    [JsonProperty("participant_id")]
    public int ParticipantId { get; set; }

    [JsonProperty("dispute_guid")]
    public Guid DisputeGuid { get; set; }

    [JsonProperty("access_code")]
    public string AccessCode { get; set; }

    [JsonProperty("name_abbreviation")]
    public string NameAbbreviation { get; set; }

    [JsonProperty("decision_delivery_method")]
    public int? DecisionDeliveryMethod { get; set; }

    [JsonProperty("address_is_validated")]
    public bool? AddressIsValidated { get; set; }

    [JsonProperty("known_contact_fields")]
    public byte? KnownContactFields { get; set; }

    [JsonProperty("receives_text_messages")]
    public byte? ReceivesTextMessages { get; set; }

    [JsonProperty("mail_address_is_validated")]
    public bool? MailAddressIsValidated { get; set; }

    [JsonProperty("is_party")]
    public bool? IsParty { get; set; }
}