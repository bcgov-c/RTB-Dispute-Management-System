using System.ComponentModel.DataAnnotations;

namespace CM.Services.PostedDecision.PostedDecisionDataService.Entities;

public class PostedDecisionIndex
{
    public int PostedDecisionId { get; set; }

    [StringLength(750)]
    public string SearchResultSummary { get; set; }

    public string SearchText { get; set; }

    [StringLength(255)]
    public string SearchTags { get; set; }

    [StringLength(255)]
    public string SearchKeyWords { get; set; }

    [StringLength(50)]
    public string AnonDecisionId { get; set; }

    [StringLength(500)]
    public string BusinessNames { get; set; }
}