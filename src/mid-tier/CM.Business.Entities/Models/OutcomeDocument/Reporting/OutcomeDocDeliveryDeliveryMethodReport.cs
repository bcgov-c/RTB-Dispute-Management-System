using Newtonsoft.Json;

namespace CM.Business.Entities.Models.OutcomeDocument.Reporting;

public class OutcomeDocDeliveryDeliveryMethodReport
{
    [JsonProperty("email_not_delivered_count")]
    public int EmailNotDeliveredCount { get; set; }

    [JsonProperty("pickup_not_delivered_count")]
    public int PickupNotDeliveredCount { get; set; }

    [JsonProperty("mail_not_delivered_count")]
    public int MailNotDeliveredCount { get; set; }

    [JsonProperty("custom_not_delivered_count")]
    public int CustomNotDeliveredCount { get; set; }
}