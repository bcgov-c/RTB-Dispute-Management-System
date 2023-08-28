using System;
using System.ComponentModel.DataAnnotations;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OutcomeDocRequest;

public class OutcomeDocRequestPatchRequest
{
    [JsonProperty("request_type")]
    public OutcomeDocRequestType? RequestType { get; set; }

    [JsonProperty("request_sub_type")]
    public OutcomeDocRequestSubType? RequestSubType { get; set; }

    [JsonProperty("affected_documents")]
    public OutcomeDocAffectedDocuments? AffectedDocuments { get; set; }

    [JsonProperty("affected_documents_text")]
    [StringLength(255)]
    public string AffectedDocumentsText { get; set; }

    [JsonProperty("date_documents_received")]
    public DateTime? DateDocumentsReceived { get; set; }

    [JsonProperty("request_description")]
    [StringLength(1000)]
    public string RequestDescription { get; set; }

    [JsonProperty("submitter_id")]
    public int SubmitterId { get; set; }

    [JsonProperty("outcome_doc_group_id")]
    public int? OutcomeDocGroupId { get; set; }

    [JsonProperty("file_description_id")]
    public int? FileDescriptionId { get; set; }

    [JsonProperty("request_status")]
    public byte RequestStatus { get; set; }

    [JsonProperty("other_status_description")]
    [StringLength(100)]
    public string OtherStatusDescription { get; set; }

    [JsonProperty("request_processing_time")]
    public int? RequestProcessingTime { get; set; }

    [JsonProperty("request_completion_date")]
    public DateTime? RequestCompletionDate { get; set; }

    [JsonProperty("submitter_details")]
    [StringLength(100)]
    public string SubmitterDetails { get; set; }

    [JsonProperty("request_date")]
    public DateTime? RequestDate { get; set; }

    [JsonProperty("request_source")]
    public byte? RequestSource { get; set; }

    [JsonProperty("request_sub_status")]
    public byte? RequestSubStatus { get; set; }
}