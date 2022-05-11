using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.EmailMessage;

public class EmailMessageListResponse
{
    public EmailMessageListResponse()
    {
        EmailMessages = new List<EmailMessageResponse>();
    }

    [JsonProperty("total_available_count")]
    public int TotalAvailableCount { get; set; }

    [JsonProperty("email_messages")]
    public List<EmailMessageResponse> EmailMessages { get; set; }
}