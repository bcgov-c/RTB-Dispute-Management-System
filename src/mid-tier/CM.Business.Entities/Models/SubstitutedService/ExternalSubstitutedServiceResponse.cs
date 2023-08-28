using System;
using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.SubstitutedService
{
    public class ExternalSubstitutedServiceResponse : CommonResponse
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

        [JsonProperty("request_method_file_desc_id")]
        public int? RequestMethodFileDescId { get; set; }

        [JsonProperty("request_status")]
        public byte? RequestStatus { get; set; }

        [JsonProperty("sub_service_approved_by")]
        public int? SubServiceApprovedById { get; set; }

        [JsonProperty("sub_service_effective_date")]
        public string SubServiceEffectiveDate { get; set; }

        [JsonProperty("sub_service_expiry_date")]
        public string SubServiceExpiryDate { get; set; }

        [JsonProperty("sub_service_doc_type")]
        public byte? SubServiceDocType { get; set; }

        [JsonProperty("outcome_document_file_id")]
        public int OutcomeDocumentFileId { get; set; }

        [JsonProperty("request_source")]
        public byte RequestSource { get; set; }

        [JsonProperty("request_additional_info")]
        public string RequestAdditionalInfo { get; set; }
    }
}
