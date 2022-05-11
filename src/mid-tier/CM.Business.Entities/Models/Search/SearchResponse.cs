using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Search;

public class SearchResponse
{
    ////Dispute
    [JsonProperty("file_number")]
    public int? FileNumber { get; set; }

    [JsonProperty("dispute_guid")]
    public Guid DisputeGuid { get; set; }

    [JsonProperty("dispute_type")]
    public byte? DisputeType { get; set; }

    [JsonProperty("dispute_sub_type")]
    public byte DisputeSubType { get; set; }

    [JsonProperty("dispute_urgency")]
    public string DisputeUrgency { get; set; }

    [JsonProperty("dispute_complexity")]
    public byte? DisputeComplexity { get; set; }

    [JsonProperty("tenancy_address")]
    public string TenancyAddress { get; set; }

    [JsonProperty("tenancy_zip_postal")]
    public string TenancyZipPostal { get; set; }

    [JsonProperty("tenancy_ended")]
    public byte? TenancyEnded { get; set; }

    [JsonProperty("creation_method")]
    public byte? CreationMethod { get; set; }

    [JsonProperty("submitted_date")]
    public string SubmittedDate { get; set; }

    [JsonProperty("created_date")]
    public string CreatedDate { get; set; }

    [JsonProperty("modified_date")]
    public string ModifiedDate { get; set; }

    [JsonProperty("dispute_last_modified_date")]
    public string DisputeLastModifiedDate { get; set; }

    ////DisputeStatus
    [JsonProperty("status")]
    public byte Status { get; set; }

    [JsonProperty("stage")]
    public byte Stage { get; set; }

    [JsonProperty("process")]
    public byte Process { get; set; }

    [JsonProperty("owner")]
    public int? Owner { get; set; }

    [JsonProperty("status_start_date")]
    public string StatusStartDate { get; set; }

    ////ClaimParticipantGroups
    [JsonProperty("total_applicants")]
    public int TotalApplicants { get; set; }

    [JsonProperty("total_respondents")]
    public int TotalRespondents { get; set; }

    ////Participants
    [JsonProperty("prime_app_participant_type")]
    public byte? ParticipantType { get; set; }

    [JsonProperty("prime_app_business_name")]
    public string BusinessName { get; set; }

    [JsonProperty("prime_app_business_contact_first_name")]
    public string BusinessContactFirstName { get; set; }

    [JsonProperty("prime_app_business_contact_last_name")]
    public string BusinessContactLastName { get; set; }

    [JsonProperty("prime_app_first_name")]
    public string FirstName { get; set; }

    [JsonProperty("prime_app_last_name")]
    public string LastName { get; set; }

    ////DisputeFees
    [JsonProperty("intake_payment_is_paid")]
    public bool IntakePaymentIsPaid { get; set; }

    [JsonProperty("intake_payment_date_paid")]
    public string IntakePaymentDatePaid { get; set; }

    [JsonProperty("intake_payment_amount_paid")]
    public decimal IntakePaymentAmountPaid { get; set; }

    [JsonProperty("intake_payment_payment_method")]
    public byte IntakePaymentAmountPaymentMethod { get; set; }

    ////Hearing
    [JsonProperty("hearing_start_date")]
    public string HearingStartDateTime { get; set; }

    [JsonProperty("local_start_date")]
    public string LocalStartDateTime { get; set; }

    [JsonProperty("hearing_type")]
    public byte HearingType { get; set; }

    [JsonProperty("hearing_owner")]
    public int HearingOwner { get; set; }

    [JsonProperty("shared_hearing_link_type")]
    public byte? SharedHearingLinkType { get; set; }

    ////Notice
    [JsonProperty("notice_generated_date")]
    public string NoticeGeneratedDate { get; set; }

    ////Claims
    [JsonProperty("claims")]
    public List<ClaimSearchResponse> Claims { get; set; }
}

public class ClaimSearchResponse
{
    [JsonProperty("claim_code")]
    public byte? ClaimCode { get; set; }
}

public class FullSearchResponse
{
    public FullSearchResponse()
    {
        SearchResponses = new List<SearchResponse>();
    }

    [JsonProperty("total_available_records")]
    public int TotalAvailableRecords { get; set; }

    [JsonProperty("results")]
    public List<SearchResponse> SearchResponses { get; set; }
}