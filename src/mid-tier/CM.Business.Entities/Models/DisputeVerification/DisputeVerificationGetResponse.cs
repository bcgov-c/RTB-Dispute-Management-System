using System.Collections.Generic;
using CM.Business.Entities.Models.VerificationAttempt;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.DisputeVerification
{
    public class DisputeVerificationGetResponse : DisputeVerificationResponse
    {
        public DisputeVerificationGetResponse()
        {
            VerificationAttempts = new List<VerificationAttemptResponse>();
        }

        [JsonProperty("verification_attempts")]
        public List<VerificationAttemptResponse> VerificationAttempts { get; set; }
    }
}
