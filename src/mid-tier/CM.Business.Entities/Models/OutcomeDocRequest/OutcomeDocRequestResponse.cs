using System;
using CM.Business.Entities.Models.Base;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OutcomeDocRequest;

public class OutcomeDocRequestResponse : CommonResponse
{
    [JsonProperty("outcome_doc_request_id")]
    public int OutcomeDocRequestId { get; set; }

    [JsonProperty("dispute_guid")]
    public Guid DisputeGuid { get; set; }

    [JsonProperty("request_type")]
    public OutcomeDocRequestType RequestType { get; set; }

    [JsonProperty("request_sub_type")]
    public OutcomeDocRequestSubType? RequestSubType { get; set; }

    [JsonProperty("affected_documents")]
    public OutcomeDocAffectedDocuments AffectedDocuments { get; set; }

    [JsonProperty("affected_documents_text")]
    public string AffectedDocumentsText { get; set; }

    [JsonProperty("date_documents_received")]
    public string DateDocumentsReceived { get; set; }

    [JsonProperty("request_description")]
    public string RequestDescription { get; set; }

    [JsonProperty("submitter_id")]
    public int SubmitterId { get; set; }

    [JsonProperty("outcome_doc_group_id")]
    public int? OutcomeDocGroupId { get; set; }

    [JsonProperty("file_description_id")]
    public int? FileDescriptionId { get; set; }

    [JsonProperty("request_status")]
    public byte? RequestStatus { get; set; }

    [JsonProperty("other_status_description")]
    public string OtherStatusDescription { get; set; }

    [JsonProperty("is_deleted")]
    public bool? IsDeleted { get; set; }

    [JsonProperty("request_processing_time")]
    public int? RequestProcessingTime { get; set; }

    [JsonProperty("request_completion_date")]
    public string RequestCompletionDate { get; set; }

    [JsonProperty("submitter_details")]
    public string SubmitterDetails { get; set; }

    [JsonProperty("request_date")]
    public string RequestDate { get; set; }

    [JsonProperty("request_source")]
    public byte? RequestSource { get; set; }
}