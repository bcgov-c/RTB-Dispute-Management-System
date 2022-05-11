using System;
using System.Collections.Generic;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Dashboard;

public class DashboardSearchResponse
{
    public DashboardSearchResponse()
    {
        Items = new List<DashboardSearchItemResponse>();
    }

    [JsonProperty("total_available_records")]
    public int TotalAvailableRecords { get; set; }

    [JsonProperty("items")]
    public List<DashboardSearchItemResponse> Items { get; set; }
}

public class DashboardSearchItemResponse
{
    [JsonProperty("file_number")]
    public int? FileNumber { get; set; }

    [JsonProperty("dispute_guid")]
    public Guid DisputeGuid { get; set; }

    [JsonProperty("dispute_type")]
    public byte? DisputeType { get; set; }

    [JsonProperty("dispute_sub_type")]
    public byte? DisputeSubType { get; set; }

    [JsonProperty("dispute_urgency")]
    public byte? DisputeUrgency { get; set; }

    [JsonProperty("dispute_complexity")]
    public DisputeComplexity? DisputeComplexity { get; set; }

    [JsonProperty("tenancy_address")]
    public string TenancyAddress { get; set; }

    [JsonProperty("tenant_zip_postal")]
    public string TenancyZipPostal { get; set; }

    [JsonProperty("cross_app_file_number")]
    public int? CrossAppFileNumber { get; set; }

    [JsonProperty("cross_app_dispute_guid")]
    public Guid? CrossAppDisputeGuid { get; set; }

    [JsonProperty("submitted_date")]
    public string SubmittedDate { get; set; }

    [JsonProperty("created_date")]
    public string CreatedDate { get; set; }

    [JsonProperty("modified_date")]
    public string ModifiedDate { get; set; }

    [JsonProperty("dispute_last_modified_date")]
    public string DisputeLastModifiedDate { get; set; }

    [JsonProperty("status")]
    public byte Status { get; set; }

    [JsonProperty("stage")]
    public byte? Stage { get; set; }

    [JsonProperty("process")]
    public byte? Process { get; set; }

    [JsonProperty("owner")]
    public int? Owner { get; set; }

    [JsonProperty("status_start_date")]
    public string StatusStartDate { get; set; }

    [JsonProperty("total_applicants")]
    public int TotalApplicants { get; set; }

    [JsonProperty("total_respondents")]
    public int TotalRespondents { get; set; }

    [JsonProperty("intake_payment_is_paid")]
    public bool? IntakePaymentIsPaid { get; set; }

    [JsonProperty("intake_payment_date_paid")]
    public string IntakePaymentDatePaid { get; set; }

    [JsonProperty("intake_payment_amount_paid")]
    public decimal? IntakePaymentAmountPaid { get; set; }

    [JsonProperty("intake_payment_payment_method")]
    public byte? IntakePaymentAmountPaymentMethod { get; set; }

    [JsonProperty("hearing_start_date")]
    public string HearingStart { get; set; }

    [JsonProperty("hearing_type")]
    public byte? HearingType { get; set; }

    [JsonProperty("hearing_owner")]
    public int? HearingOwner { get; set; }

    [JsonProperty("notice_generated_date")]
    public string NoticeGeneratedDate { get; set; }

    [JsonProperty("claims")]
    public List<DsClaim> Claims { get; set; }
}

public class DashboardSearchDisputeResponse : DashboardSearchItemResponse
{
    [JsonProperty("creation_method")]
    public byte? CreationMethod { get; set; }
}