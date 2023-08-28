using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.ParticipantIdentity
{
    public class ParticipantIdentitiesResponse
    {
        public ParticipantIdentitiesResponse()
        {
            ParticipantIdentities = new List<ParticipantIdentityResponse>();
        }

        [JsonProperty("total_available_records")]
        public int TotalAvailableRecords { get; set; }

        [JsonProperty("participant_identities")]
        public List<ParticipantIdentityResponse> ParticipantIdentities { get; set; }
    }
}
