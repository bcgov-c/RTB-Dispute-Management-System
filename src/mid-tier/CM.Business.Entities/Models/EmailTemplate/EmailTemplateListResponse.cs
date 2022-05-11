using System.Collections.Generic;
using Newtonsoft.Json;

namespace CM.Business.Entities.Models.EmailTemplate;

public class EmailTemplateListResponse
{
    public EmailTemplateListResponse()
    {
        EmailTemplates = new List<EmailTemplateResponse>();
    }

    [JsonProperty("total_available_count")]
    public int TotalAvailableCount { get; set; }

    [JsonProperty("email_templates")]
    public List<EmailTemplateResponse> EmailTemplates { get; set; }
}