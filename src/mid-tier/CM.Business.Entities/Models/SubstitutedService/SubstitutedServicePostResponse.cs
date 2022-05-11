using System;
using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.SubstitutedService;

public class SubstitutedServicePostResponse : CommonResponse
{
    [JsonProperty("sub_service_id")]
    public int SubstitutedServiceId { get; set; }

    [JsonProperty("dispute_guid")]
    public Guid DisputeGuid { get; set; }

    [JsonProperty("service_by_participant_id")]
    public int ServiceByParticipantId { get; set; }

    [JsonProperty("service_to_participant_id")]
    public int ServiceToParticipantId { get; set; }

    [JsonProperty("request_doc_type")]
    public byte? RequestDocType { get; set; }

    [JsonProperty("request_doc_other_description")]
    public string RequestDocOtherDescription { get; set; }

    [JsonProperty("failed_method1_type")]
    public byte? FailedMethod1Type { get; set; }

    [JsonProperty("failed_method1_description")]
    public string FailedMethod1Description { get; set; }

    [JsonProperty("failed_method1_specifics")]
    public string FailedMethod1Specifics { get; set; }

    [JsonProperty("failed_method1_date")]
    public string FailedMethod1Date { get; set; }

    [JsonProperty("failed_method1_note")]
    public string FailedMethod1Note { get; set; }

    [JsonProperty("failed_method1_file_desc_id")]
    public int? FailedMethod1FileDescId { get; set; }

    [JsonProperty("failed_method2_type")]
    public byte? FailedMethod2Type { get; set; }

    [JsonProperty("failed_method2_description")]
    public string FailedMethod2Description { get; set; }

    [JsonProperty("failed_method2_specifics")]
    public string FailedMethod2Specifics { get; set; }

    [JsonProperty("failed_method2_date")]
    public string FailedMethod2Date { get; set; }

    [JsonProperty("failed_method2_note")]
    public string FailedMethod2Note { get; set; }

    [JsonProperty("failed_method2_file_desc_id")]
    public int? FailedMethod2FileDescId { get; set; }

    [JsonProperty("failed_method3_type")]
    public byte? FailedMethod3Type { get; set; }

    [JsonProperty("failed_method3_description")]
    public string FailedMethod3Description { get; set; }

    [JsonProperty("failed_method3_specifics")]
    public string FailedMethod3Specifics { get; set; }

    [JsonProperty("failed_method3_date")]
    public string FailedMethod3Date { get; set; }

    [JsonProperty("failed_method3_note")]
    public string FailedMethod3Note { get; set; }

    [JsonProperty("failed_method3_proof_file_desc_id")]
    public int? FailedMethod3FileDescId { get; set; }

    [JsonProperty("other_failed_method_details")]
    public string OtherFailedMethodDetails { get; set; }

    [JsonProperty("is_respondent_avoiding")]
    public byte? IsRespondentAvoiding { get; set; }

    [JsonProperty("respondent_avoiding_details")]
    public string RespondentAvoidingDetails { get; set; }

    [JsonProperty("requesting_time_extension")]
    public byte? RequestingTimeExtension { get; set; }

    [JsonProperty("requesting_time_extension_date")]
    public string RequestingTimeExtensionDate { get; set; }

    [JsonProperty("requesting_service_directions")]
    public byte? RequestingServiceDirections { get; set; }

    [JsonProperty("requested_method_description")]
    public string RequestedMethodDescription { get; set; }

    [JsonProperty("requested_method_justification")]
    public string RequestedMethodJustification { get; set; }

    [JsonProperty("request_method_file_desc_id")]
    public int? RequestMethodFileDescId { get; set; }

    [JsonProperty("request_notes")]
    public string RequestNotes { get; set; }

    [JsonProperty("request_status")]
    public byte? RequestStatus { get; set; }

    [JsonProperty("sub_service_approved_by")]
    public int? SubServiceApprovedById { get; set; }

    [JsonProperty("sub_service_title")]
    public string SubServiceTitle { get; set; }

    [JsonProperty("sub_service_instructions")]
    public string SubServiceInstructions { get; set; }

    [JsonProperty("sub_service_effective_date")]
    public string SubServiceEffectiveDate { get; set; }

    [JsonProperty("sub_service_expiry_date")]
    public string SubServiceExpiryDate { get; set; }

    [JsonProperty("sub_service_doc_type")]
    public byte? SubServiceDocType { get; set; }

    [JsonProperty("sub_service_doc_other_description")]
    public string SubServiceOtherDescription { get; set; }

    [JsonProperty("outcome_document_file_id")]
    public int OutcomeDocumentFileId { get; set; }

    [JsonProperty("request_source")]
    public byte RequestSource { get; set; }

    [JsonProperty("request_additional_info")]
    public string RequestAdditionalInfo { get; set; }
}