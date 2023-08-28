using System;
using CM.Business.Entities.Models.Base;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OutcomeDocument
{
    public class ExternalOutcomeDocDeliveryResponse : CommonResponse
    {
        [JsonProperty("outcome_doc_delivery_id")]
        public int OutcomeDocDeliveryId { get; set; }

        [JsonProperty("dispute_guid")]
        public Guid DisputeGuid { get; set; }

        [JsonProperty("outcome_doc_file_id")]
        public int OutcomeDocFileId { get; set; }

        [JsonProperty("participant_id")]
        public int? ParticipantId { get; set; }

        [JsonProperty("delivery_priority")]
        public byte? DeliveryPriority { get; set; }

        [JsonProperty("ready_for_delivery")]
        public bool ReadyForDelivery { get; set; }

        [JsonProperty("ready_for_delivery_date")]
        public string ReadyForDeliveryDate { get; set; }

        [JsonProperty("is_delivered")]
        public bool? IsDelivered { get; set; }

        [JsonProperty("delivery_date")]
        public string DeliveryDate { get; set; }

        [JsonProperty("delivery_method")]
        public byte? DeliveryMethod { get; set; }
    }
}
