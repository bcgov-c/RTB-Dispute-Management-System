using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.EmailMessage
{
    public class ExternalEmailMessagesResponse
    {
        public ExternalEmailMessagesResponse()
        {
            EmailMessages = new List<ExternalEmailMessageResponse>();
        }

        [JsonProperty("total_available_count")]
        public int TotalAvailableCount { get; set; }

        [JsonProperty("email_messages")]
        public List<ExternalEmailMessageResponse> EmailMessages { get; set; }
    }
}
