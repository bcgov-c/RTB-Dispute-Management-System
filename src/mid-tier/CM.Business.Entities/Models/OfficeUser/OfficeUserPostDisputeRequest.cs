using System;
using System.ComponentModel.DataAnnotations;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OfficeUser;

public class OfficeUserPostDisputeRequest
{
    ////Dispute
    [JsonProperty("dispute_type")]
    public byte DisputeType { get; set; }

    [JsonProperty("dispute_sub_type")]
    public byte DisputeSubType { get; set; }

    [JsonProperty("dispute_urgency")]
    public byte? DisputeUrgency { get; set; }

    [StringLength(80)]
    [JsonProperty("tenancy_address")]
    [Required]
    public string TenancyAddress { get; set; }

    [StringLength(50)]
    [JsonProperty("tenancy_city")]
    [Required]
    public string TenancyCity { get; set; }

    [StringLength(50)]
    [JsonProperty("tenancy_country")]
    [Required]
    public string TenancyCountry { get; set; }

    [StringLength(7)]
    [JsonProperty("tenancy_zip_postal")]
    [Required]
    public string TenancyZipPostal { get; set; }

    [JsonProperty("tenancy_ended")]
    public byte? TenancyEnded { get; set; }

    [JsonProperty("tenancy_end_date")]
    public DateTime? TenancyEndDate { get; set; }

    [JsonProperty("cross_app_file_number")]
    public int? CrossAppFileNumber { get; set; }

    [JsonProperty("submitted_date")]
    [Required]
    public DateTime SubmittedDate { get; set; }

    [JsonProperty("process")]
    public byte Process { get; set; }

    [JsonProperty("tenancy_unit_type")]
    public TenancyUnitType? TenancyUnitType { get; set; }

    [JsonProperty("tenancy_unit_text")]
    public string TenancyUnitText { get; set; }

    ////Participant
    [JsonProperty("participant_type")]
    public byte ParticipantType { get; set; }

    [JsonProperty("participant_status")]
    public byte? ParticipantStatus { get; set; }

    [StringLength(100)]
    [JsonProperty("business_name")]
    public string BusinessName { get; set; }

    [StringLength(50)]
    [JsonProperty("business_contact_first_name")]
    public string BusinessContactFirstName { get; set; }

    [StringLength(70)]
    [JsonProperty("business_contact_last_name")]
    public string BusinessContactLastName { get; set; }

    [StringLength(50)]
    [JsonProperty("first_name")]
    public string FirstName { get; set; }

    [StringLength(70)]
    [JsonProperty("last_name")]
    public string LastName { get; set; }

    [JsonProperty("accepted_tou")]
    public bool AcceptedTou { get; set; }

    [StringLength(100)]
    [JsonProperty("email")]
    public string Email { get; set; }

    [JsonProperty("no_email")]
    public bool? NoEmail { get; set; }

    [StringLength(15)]
    [JsonProperty("primary_phone")]
    [Required]
    public string PrimaryPhone { get; set; }

    [JsonProperty("primary_contact_method")]
    public byte? PrimaryContactMethod { get; set; }

    [JsonProperty("package_delivery_method")]
    public byte PackageDeliveryMethod { get; set; }

    [JsonProperty("creation_method")]
    public byte? CreationMethod { get; set; }

    [JsonProperty("amount_due")]
    public decimal? AmountDue { get; set; }
}