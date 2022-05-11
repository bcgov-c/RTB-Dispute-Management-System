using Newtonsoft.Json;

namespace CM.Business.Entities.Models.SiteVersion;

public class SiteVersionResponse
{
    [JsonProperty("current_utc_date_time")]
    public string CurrentUtcDateTime { get; set; }

    [JsonProperty("site_version_id")]
    public int SiteVersionId { get; set; }

    [JsonProperty("token_method")]
    public byte TokenMethod { get; set; }

    [JsonProperty("release_number")]
    public string ReleaseNumber { get; set; }

    [JsonProperty("release_date")]
    public string ReleaseDate { get; set; }

    [JsonProperty("release_details")]
    public string ReleaseDetails { get; set; }

    [JsonProperty("ui_version")]
    public string UiVersion { get; set; }

    [JsonProperty("ui_version_date")]
    public string UiVersionDate { get; set; }

    [JsonProperty("mid_tier_version")]
    public string MidTierVersion { get; set; }

    [JsonProperty("mid_tier_version_date")]
    public string MidTierVersionDate { get; set; }

    [JsonProperty("pdf_version")]
    public string PdfVersion { get; set; }

    [JsonProperty("pdf_version-date")]
    public string PdfVersionDate { get; set; }

    [JsonProperty("email_generator_version")]
    public string EmailGeneratorVersion { get; set; }

    [JsonProperty("email_generator_version_date")]
    public string EmailGeneratorVersionDate { get; set; }

    [JsonProperty("email_notification_version")]
    public string EmailNotificationVersion { get; set; }

    [JsonProperty("email_notification_version_date")]
    public string EmailNotificationVersionDate { get; set; }

    [JsonProperty("created_date")]
    public string CreatedDate { get; set; }
}