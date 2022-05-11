using System;
using System.ComponentModel.DataAnnotations;

namespace CM.Services.PostedDecision.PostedDecisionDataService.Models;

public class PostedDecisionOutcome
{
    public int PostedDecisionOutcomeId { get; set; }

    public PostedDecision PostedDecision { get; set; }

    public int PostedDecisionId { get; set; }

    public int? ClaimId { get; set; }

    public byte? ClaimType { get; set; }

    public byte? ClaimCode { get; set; }

    public int? RemedyId { get; set; }

    public byte RemedyType { get; set; }

    public byte RemedyStatus { get; set; }

    public byte? RemedySubStatus { get; set; }

    [StringLength(255)]
    public string ClaimTitle { get; set; }

    [StringLength(255)]
    public string RelatedSections { get; set; }

    public decimal? RemedyAmountRequested { get; set; }

    public decimal? RemedyAmountAwarded { get; set; }

    public DateTime? PostingDate { get; set; }

    public int PostedBy { get; set; }

    public bool? IsDeleted { get; set; }
}