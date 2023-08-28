using System;
using System.ComponentModel.DataAnnotations;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Dispute;

public class DisputeRequest
{
    [JsonProperty("dispute_type")]
    public byte? DisputeType { get; set; }

    [JsonProperty("owner_system_user_id")]
    public int? OwnerSystemUserId { get; set; }

    [JsonProperty("dispute_sub_type")]
    public byte? DisputeSubType { get; set; }

    [JsonProperty("tenancy_address")]
    [StringLength(80)]
    public string TenancyAddress { get; set; }

    [JsonProperty("tenancy_city")]
    [StringLength(50)]
    public string TenancyCity { get; set; }

    [JsonProperty("tenancy_country")]
    public string TenancyCountry { get; set; }

    [JsonProperty("tenancy_zip_postal")]
    [StringLength(7)]
    public string TenancyZipPostal { get; set; }

    [JsonProperty("tenancy_ended")]
    public byte? TenancyEnded { get; set; }

    [JsonProperty("tenancy_end_date")]
    public DateTime? TenancyEndDate { get; set; }

    [JsonProperty("tenancy_geozone_id")]
    public byte? TenancyGeozoneId { get; set; }

    [JsonProperty("tenancy_address_validated")]
    public bool? TenancyAddressValidated { get; set; }

    [JsonProperty("tenancy_agreement_date")]
    public DateTime? TenancyAgreementDate { get; set; }

    [JsonProperty("tenancy_agreement_signed_by")]
    public byte? TenancyAgreementSignedBy { get; set; }

    [JsonProperty("cross_app_file_number")]
    public int? CrossAppFileNumber { get; set; }

    [JsonProperty("cross_app_dispute_guid")]
    public Guid? CrossAppDisputeGuid { get; set; }

    [JsonProperty("cross_app_role")]
    public byte? CrossAppRole { get; set; }

    [JsonProperty("original_notice_delivered")]
    public bool? OriginalNoticeDelivered { get; set; }

    [JsonProperty("original_notice_date")]
    public DateTime? OriginalNoticeDate { get; set; }

    [JsonProperty("original_notice_id")]
    public int? OriginalNoticeId { get; set; }

    [JsonProperty("creation_method")]
    public byte? CreationMethod { get; set; }

    [JsonProperty("submitted_date")]
    public DateTime? SubmittedDate { get; set; }

    [JsonProperty("submitted_by")]
    public int? SubmittedBy { get; set; }

    [JsonProperty("initial_payment_date")]
    public DateTime? InitialPaymentDate { get; set; }

    [JsonProperty("initial_payment_by")]
    public int? InitialPaymentBy { get; set; }

    [JsonProperty("initial_payment_method")]
    public byte? InitialPaymentMethod { get; set; }

    [JsonProperty("is_amended")]
    public bool? IsAmended { get; set; }

    [JsonProperty("tenancy_start_date")]
    public DateTime? TenancyStartDate { get; set; }

    [JsonProperty("security_deposit_amount")]
    public decimal? SecurityDepositAmount { get; set; }

    [JsonProperty("pet_damage_deposit_amount")]
    public decimal? PetDamageDepositAmount { get; set; }

    [JsonProperty("rent_payment_amount")]
    public decimal? RentPaymentAmount { get; set; }

    [JsonProperty("rent_payment_interval")]
    [StringLength(100)]
    public string RentPaymentInterval { get; set; }

    [JsonProperty("dispute_urgency")]
    public byte? DisputeUrgency { get; set; }

    [JsonProperty("dispute_complexity")]
    public DisputeComplexity? DisputeComplexity { get; set; }

    [JsonProperty("migration_source_of_truth")]
    public byte? MigrationSourceOfTruth { get; set; }

    [JsonProperty("tenancy_units")]
    public int? TenancyUnits { get; set; }

    [JsonProperty("tenancy_unit_type")]
    public TenancyUnitType? TenancyUnitType { get; set; }

    [JsonProperty("tenancy_unit_text")]
    public string TenancyUnitText { get; set; }
}