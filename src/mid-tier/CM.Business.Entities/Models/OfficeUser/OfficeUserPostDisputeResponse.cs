using System;
using System.Collections.Generic;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OfficeUser;

public class OfficeUserPostDisputeResponse
{
    [JsonIgnore]
    public int DisputeId { get; set; }

    [JsonProperty("dispute_guid")]
    public Guid DisputeGuid { get; set; }

    [JsonProperty("file_number")]
    public int? FileNumber { get; set; }

    [JsonProperty("cross_app_file_number")]
    public int? CrossAppFileNumber { get; set; }

    [JsonProperty("dispute_type")]
    public byte? DisputeType { get; set; }

    [JsonProperty("dispute_sub_type")]
    public byte? DisputeSubType { get; set; }

    [JsonProperty("dispute_urgency")]
    public byte? DisputeUrgency { get; set; }

    [JsonProperty("dispute_complexity")]
    public DisputeComplexity? DisputeComplexity { get; set; }

    [JsonProperty("created_date")]
    public string CreatedDate { get; set; }

    [JsonProperty("modified_date")]
    public string ModifiedDate { get; set; }

    [JsonProperty("submitted_date")]
    public string SubmittedDate { get; set; }

    [JsonProperty("dispute_last_modified_date")]
    public string DisputeLastModifiedDate { get; set; }

    [JsonProperty("dispute_status")]
    public byte? Status { get; set; }

    [JsonProperty("dispute_stage")]
    public byte? Stage { get; set; }

    [JsonProperty("dispute_process")]
    public byte? Process { get; set; }

    [JsonProperty("claim_groups")]
    public List<OfficeUserPostDisputeClaimGroup> ClaimGroups { get; set; }

    [JsonProperty("dispute_fees")]
    public List<OfficeUserDisputeFee> DisputeFees { get; set; }

    [JsonProperty("tenancy_address_validated")]
    public bool? TenancyAddressValidated { get; set; }
}