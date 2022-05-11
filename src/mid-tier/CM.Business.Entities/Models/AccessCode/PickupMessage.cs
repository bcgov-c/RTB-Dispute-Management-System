using Newtonsoft.Json;

namespace CM.Business.Entities.Models.AccessCode;

public class PickupMessage
{
    [JsonProperty("email_message_id")]
    public int EmailMessageId { get; set; }

    [JsonProperty("message_type")]
    public byte MessageType { get; set; }

    [JsonProperty("participant_id")]
    public int? ParticipantId { get; set; }

    [JsonProperty("send_status")]
    public byte? SendStatus { get; set; }

    [JsonProperty("is_active")]
    public bool IsActive { get; set; }
}