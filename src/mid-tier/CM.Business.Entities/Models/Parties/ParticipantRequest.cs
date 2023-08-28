using System;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Parties;

public class ParticipantRequest
{
    [JsonProperty("participant_type")]
    public byte ParticipantType { get; set; }

    [JsonProperty("participant_status")]
    public byte ParticipantStatus { get; set; }

    [JsonProperty("bus_name")]
    [StringLength(100)]
    public string BusinessName { get; set; }

    [JsonProperty("bus_contact_first_name")]
    [StringLength(50)]
    public string BusinessContactFirstName { get; set; }

    [JsonProperty("bus_contact_last_name")]
    [StringLength(70)]
    public string BusinessContactLastName { get; set; }

    [JsonProperty("first_name")]
    [StringLength(50)]
    public string FirstName { get; set; }

    [JsonProperty("last_name")]
    [StringLength(70)]
    public string LastName { get; set; }

    [JsonProperty("accepted_tou")]
    [Required]
    public bool AcceptedTou { get; set; }

    [JsonProperty("accepted_tou_date")]
    public DateTime? AcceptedTouDate { get; set; }

    [JsonProperty("email")]
    [StringLength(100)]
    public string Email { get; set; }

    [JsonProperty("no_email")]
    public bool NoEmail { get; set; }

    [JsonProperty("email_verified")]
    public bool? EmailVerified { get; set; }

    [JsonProperty("primary_phone")]
    [StringLength(15)]
    public string PrimaryPhone { get; set; }

    [JsonProperty("primary_phone_ext")]
    [StringLength(4)]
    public string PrimaryPhoneExtension { get; set; }

    [JsonProperty("primary_phone_type")]
    public byte? PrimaryPhoneType { get; set; }

    [JsonProperty("primary_phone_verified")]
    public bool? PrimaryPhoneVerified { get; set; }

    [JsonProperty("secondary_phone")]
    [StringLength(15)]
    public string SecondaryPhone { get; set; }

    [JsonProperty("secondary_phone_ext")]
    [StringLength(4)]
    public string SecondaryPhoneExtension { get; set; }

    [JsonProperty("secondary_phone_type")]
    public byte? SecondaryPhoneType { get; set; }

    [JsonProperty("secondary_phone_verified")]
    public bool? SecondaryPhoneVerified { get; set; }

    [JsonProperty("fax")]
    [StringLength(15)]
    public string Fax { get; set; }

    [JsonProperty("primary_contact_method")]
    public byte? PrimaryContactMethod { get; set; }

    [JsonProperty("secondary_contact_method")]
    public byte? SecondaryContactMethod { get; set; }

    [JsonProperty("address")]
    [StringLength(125)]
    public string Address { get; set; }

    [JsonProperty("city")]
    [StringLength(50)]
    public string City { get; set; }

    [JsonProperty("province_state")]
    [StringLength(50)]
    public string ProvinceState { get; set; }

    [JsonProperty("province_state_id")]
    public byte ProvinceStateId { get; set; }

    [JsonProperty("country")]
    [StringLength(50)]
    public string Country { get; set; }

    [JsonProperty("country_id")]
    public byte CountryId { get; set; }

    [JsonProperty("postal_zip")]
    [StringLength(15)]
    public string PostalZip { get; set; }

    [JsonProperty("mail_address")]
    [StringLength(125)]
    public string MailAddress { get; set; }

    [JsonProperty("mail_city")]
    [StringLength(50)]
    public string MailCity { get; set; }

    [JsonProperty("mail_province_state")]
    [StringLength(50)]
    public string MailProvinceState { get; set; }

    [JsonProperty("mail_country")]
    [StringLength(50)]
    public string MailCountry { get; set; }

    [JsonProperty("mail_postal_zip")]
    [StringLength(15)]
    public string MailPostalZip { get; set; }

    [JsonProperty("package_delivery_method")]
    public byte? PackageDeliveryMethod { get; set; }

    [JsonProperty("is_amended")]
    public bool? IsAmended { get; set; }

    [JsonProperty("is_sub_service")]
    public bool? IsSubService { get; set; }

    [JsonProperty("unit_type")]
    public byte? UnitType { get; set; }

    [JsonProperty("unit_text")]
    [StringLength(50)]
    public string UnitText { get; set; }

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