using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OutcomeDocument
{
    public class ExternalOutcomeDocGroupRequest
    {
        [JsonProperty("delivery_participant_ids")]
        [Required]
        public int[] DeliveryParticipantIds { get; set; }
    }
}
