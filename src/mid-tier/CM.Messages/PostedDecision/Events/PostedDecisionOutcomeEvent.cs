using System.ComponentModel.DataAnnotations;

namespace CM.Messages.PostedDecision.Events;

public class PostedDecisionOutcomeEvent
{
    public int? ClaimId { get; set; }

    public byte? ClaimType { get; set; }

    public byte? ClaimCode { get; set; }

    public int? RemedyId { get; set; }

    public byte RemedyType { get; set; }

    public byte RemedyStatus { get; set; }

    public byte? RemedySubStatus { get; set; }

    [StringLength(255)]
    public string ClaimTitle { get; set; }

    public string RelatedSections { get; set; }

    public decimal? RemedyAmountRequested { get; set; }

    public decimal? RemedyAmountAwarded { get; set; }
}