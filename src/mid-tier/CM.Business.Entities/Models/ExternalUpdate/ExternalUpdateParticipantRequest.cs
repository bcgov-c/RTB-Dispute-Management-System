using System;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ExternalUpdate;

public class ExternalUpdateParticipantRequest
{
    [JsonProperty("accepted_tou")]
    public bool AcceptedTou { get; set; }

    [JsonProperty("accepted_tou_date")]
    public DateTime? AcceptedTouDate { get; set; }

    [JsonProperty("email")]
    public string Email { get; set; }

    [JsonProperty("no_email")]
    public bool? NoEmail { get; set; }

    [JsonProperty("email_verified")]
    public bool? EmailVerified { get; set; }

    [StringLength(15)]
    [JsonProperty("primary_phone")]
    public string PrimaryPhone { get; set; }

    [JsonProperty("primary_phone_verified")]
    public bool? PrimaryPhoneVerified { get; set; }

    [StringLength(15)]
    [JsonProperty("secondary_phone")]
    public string SecondaryPhone { get; set; }

    [JsonProperty("secondary_phone_verified")]
    public bool? SecondaryPhoneVerified { get; set; }

    [StringLength(15)]
    [JsonProperty("fax")]
    public string Fax { get; set; }

    [JsonProperty("primary_contact_method")]
    public byte? PrimaryContactMethod { get; set; }

    [JsonProperty("secondary_contact_method")]
    public byte? SecondaryContactMethod { get; set; }

    [JsonProperty("address_is_validated")]
    public bool AddressIsValidated { get; set; }

    [JsonProperty("mail_address_is_validated")]
    public bool MailAddressIsValidated { get; set; }
}