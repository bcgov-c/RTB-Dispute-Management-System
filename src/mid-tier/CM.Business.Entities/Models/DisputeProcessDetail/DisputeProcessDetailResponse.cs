using System;
using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.DisputeProcessDetail;

public class DisputeProcessDetailResponse : CommonResponse
{
    [JsonProperty("dispute_process_detail_id")]
    public int DisputeProcessDetailId { get; set; }

    [JsonProperty("start_dispute_status_id")]
    public int StartDisputeStatusId { get; set; }

    [JsonProperty("dispute_guid")]
    public Guid DisputeGuid { get; set; }

    [JsonProperty("associated_process")]
    public byte AssociatedProcess { get; set; }

    [JsonProperty("process_applicant1_id")]
    public int? ProcessApplicant1Id { get; set; }

    [JsonProperty("process_applicant2_id")]
    public int? ProcessApplicant2Id { get; set; }

    [JsonProperty("process_duration")]
    public int? ProcessDuration { get; set; }

    [JsonProperty("preparation_duration")]
    public int? PreparationDuration { get; set; }

    [JsonProperty("writing_duration")]
    public int? WritingDuration { get; set; }

    [JsonProperty("process_complexity")]
    public byte? ProcessComplexity { get; set; }

    [JsonProperty("process_method")]
    public byte? ProcessMethod { get; set; }

    [JsonProperty("process_outcome_code")]
    public byte? ProcessOutcomeCode { get; set; }

    [JsonProperty("process_reason_code")]
    public byte? ProcessReasonCode { get; set; }

    [JsonProperty("process_outcome_title")]
    public string ProcessOutcomeTitle { get; set; }

    [JsonProperty("process_outcome_description")]
    public string ProcessOutcomeDescription { get; set; }

    [JsonProperty("process_outcome_note")]
    public string ProcessOutcomeNote { get; set; }
}