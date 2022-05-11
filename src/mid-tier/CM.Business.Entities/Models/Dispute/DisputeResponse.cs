using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using CM.Business.Entities.Models.AccessCode;
using CM.Business.Entities.Models.Base;
using CM.Business.Entities.Models.DisputeFlag;
using CM.Business.Entities.Models.Hearing;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Dispute;

public class DisputeResponse : CommonResponse
{
    [JsonIgnore]
    public int DisputeId { get; set; }

    [JsonProperty("dispute_guid")]
    public Guid DisputeGuid { get; set; }

    [JsonProperty("file_number")]
    public int? FileNumber { get; set; }

    [JsonProperty("owner_system_user_id")]
    public int OwnerSystemUserId { get; set; }

    [JsonProperty("dispute_type")]
    public byte? DisputeType { get; set; }

    [JsonProperty("dispute_sub_type")]
    public byte? DisputeSubType { get; set; }

    [StringLength(80)]
    [JsonProperty("tenancy_address")]
    public string TenancyAddress { get; set; }

    [StringLength(50)]
    [JsonProperty("tenancy_city")]
    public string TenancyCity { get; set; }

    [StringLength(50)]
    [JsonProperty("tenancy_country")]
    public string TenancyCountry { get; set; }

    [StringLength(7)]
    [JsonProperty("tenancy_zip_postal")]
    public string TenancyZipPostal { get; set; }

    [JsonProperty("tenancy_ended")]
    public byte? TenancyEnded { get; set; }

    [JsonProperty("tenancy_end_date")]
    public string TenancyEndDate { get; set; }

    [JsonProperty("tenancy_agreement_date")]
    public string TenancyAgreementDate { get; set; }

    [JsonProperty("tenancy_agreement_signed_by")]
    public byte? TenancyAgreementSignedBy { get; set; }

    [JsonProperty("tenancy_geozone_id")]
    public byte? TenancyGeozoneId { get; set; }

    [JsonProperty("tenancy_address_validated")]
    public byte? TenancyAddressValidated { get; set; }

    [JsonProperty("cross_app_file_number")]
    public int? CrossAppFileNumber { get; set; }

    [JsonProperty("cross_app_dispute_guid")]
    public Guid? CrossAppDisputeGuid { get; set; }

    [JsonProperty("cross_app_role")]
    public byte? CrossAppRole { get; set; }

    [JsonProperty("original_notice_delivered")]
    public bool? OriginalNoticeDelivered { get; set; }

    [JsonProperty("original_notice_date")]
    public string OriginalNoticeDate { get; set; }

    [JsonProperty("original_notice_id")]
    public int? OriginalNoticeId { get; set; }

    [JsonProperty("creation_method")]
    public byte? CreationMethod { get; set; }

    [JsonProperty("submitted_date")]
    public string SubmittedDate { get; set; }

    [JsonProperty("submitted_by")]
    public int? SubmittedBy { get; set; }

    [JsonProperty("is_amended")]
    public bool? IsAmended { get; set; }

    [JsonProperty("initial_payment_date")]
    public string InitialPaymentDate { get; set; }

    [JsonProperty("initial_payment_by")]
    public int? InitialPaymentBy { get; set; }

    [JsonProperty("initial_payment_method")]
    public byte? InitialPaymentMethod { get; set; }

    [JsonProperty("tenancy_start_date")]
    public string TenancyStartDate { get; set; }

    [JsonProperty("security_deposit_amount")]
    public decimal? SecurityDepositAmount { get; set; }

    [JsonProperty("pet_damage_deposit_amount")]
    public decimal? PetDamageDepositAmount { get; set; }

    [JsonProperty("rent_payment_amount")]
    public decimal? RentPaymentAmount { get; set; }

    [JsonProperty("rent_payment_interval")]
    public string RentPaymentInterval { get; set; }

    [JsonProperty("dispute_urgency")]
    public byte? DisputeUrgency { get; set; }

    [JsonProperty("dispute_complexity")]
    public DisputeComplexity? DisputeComplexity { get; set; }

    [JsonProperty("migration_source_of_truth")]
    public byte? MigrationSourceOfTruth { get; set; }

    [JsonProperty("status")]
    public DisputeStatusResponse LastDisputeStatus { get; set; }

    [JsonProperty("hearing")]
    public DisputeListHearingResponse DisputeHearing { get; set; }

    [JsonProperty("dispute_last_modified_date")]
    public string DisputeLastModifiedDate { get; set; }

    [JsonProperty("dispute_last_modified_by")]
    public int? DisputeLastModifiedBy { get; set; }

    [JsonProperty("dispute_last_modified_source")]
    public string DisputeLastModifiedSource { get; set; }

    [JsonProperty("case_file_last_modified_date")]
    public string CaseFileLastModifiedDate { get; set; }

    [JsonProperty("tenancy_units")]
    public int? TenancyUnits { get; set; }

    [JsonProperty("tenancy_unit_type")]
    public TenancyUnitType? TenancyUnitType { get; set; }

    [JsonProperty("tenancy_unit_text")]
    public string TenancyUnitText { get; set; }

    [JsonProperty("files_storage_setting")]
    public DisputeStorageType FilesStorageSetting { get; set; }

    [JsonProperty("linked_dispute_flags")]
    public List<PostDisputeFlagResponse> LinkedDisputeFlags { get; set; }
}

public class DisputeListResponseEntity : DisputeResponse
{
    [JsonProperty("primary_applicant_access_code")]
    public string PrimaryApplicantAccessCode { get; set; }

    [JsonProperty("unpaid_intake_fee")]
    public bool UnpaidIntakeFee { get; set; }

    [JsonProperty("claim_groups")]
    public List<DisputeAccessClaimGroup> ClaimGroups { get; set; }
}