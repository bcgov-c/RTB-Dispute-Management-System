using System;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OutcomeDocument;

public class OutcomeDocDeliveryRequest
{
    [JsonProperty("delivery_method")]
    public byte? DeliveryMethod { get; set; }

    [StringLength(500)]
    [JsonProperty("delivery_comment")]
    public string DeliveryComment { get; set; }

    [JsonProperty("delivery_priority")]
    public byte? DeliveryPriority { get; set; }

    [JsonProperty("ready_for_delivery")]
    public bool? ReadyForDelivery { get; set; }

    [JsonProperty("ready_for_delivery_date")]
    public DateTime? ReadyForDeliveryDate { get; set; }

    [JsonProperty("associated_email_id")]
    public int? AssociatedEmailId { get; set; }
}

public class OutcomeDocDeliveryPostRequest : OutcomeDocDeliveryRequest
{
    [JsonProperty("dispute_guid")]
    public Guid DisputeGuid { get; set; }

    [JsonProperty("participant_id")]
    public int? ParticipantId { get; set; }

    [JsonProperty("is_delivered")]
    public bool? IsDelivered { get; set; }

    [JsonProperty("delivery_date")]
    public DateTime? DeliveryDate { get; set; }

    [JsonProperty("confirmed_received")]
    public bool? ConfirmedReceived { get; set; }

    [JsonProperty("received_date")]
    public DateTime? ReceivedDate { get; set; }
}

public class OutcomeDocDeliveryPatchRequest : OutcomeDocDeliveryRequest
{
    [JsonIgnore]
    public Guid DisputeGuid { get; set; }

    [JsonProperty("is_delivered")]
    public bool? IsDelivered { get; set; }

    [JsonProperty("delivery_date")]
    public DateTime? DeliveryDate { get; set; }

    [JsonProperty("confirmed_received")]
    public bool? ConfirmedReceived { get; set; }

    [JsonProperty("received_date")]
    public DateTime? ReceivedDate { get; set; }
}