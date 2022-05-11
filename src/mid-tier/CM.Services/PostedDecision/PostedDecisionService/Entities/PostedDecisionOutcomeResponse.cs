using Newtonsoft.Json;

namespace CM.Services.PostedDecision.PostedDecisionDataService.Entities;

public class PostedDecisionOutcomeResponse
{
    [JsonProperty("posted_decision_outcome_id")]
    public int PostedDecisionOutcomeId { get; set; }

    [JsonProperty("posted_decision_id")]
    public int PostedDecisionId { get; set; }

    [JsonProperty("claim_id")]
    public int ClaimId { get; set; }

    [JsonProperty("remedy_id")]
    public int RemedyId { get; set; }

    [JsonProperty("remedy_type")]
    public byte RemedyType { get; set; }

    [JsonProperty("remedy_status")]
    public byte RemedyStatus { get; set; }

    [JsonProperty("remedy_sub_status")]
    public byte? RemedySubStatus { get; set; }

    [JsonProperty("claim_title")]
    public string ClaimTitle { get; set; }

    [JsonProperty("claim_code")]
    public byte? ClaimCode { get; set; }

    [JsonProperty("related_sections")]
    public string RelatedSections { get; set; }

    [JsonProperty("remedy_amount_requested")]
    public decimal? RemedyAmountRequested { get; set; }

    [JsonProperty("remedy_amount_awarded")]
    public decimal? RemedyAmountAwarded { get; set; }

    [JsonProperty("posting_date")]
    public string PostingDate { get; set; }

    [JsonProperty("posted_by")]
    public int PostedBy { get; set; }
}