using System;

namespace CM.Services.PostedDecision.PostedDecisionDataService.Entities;

public class PostedDecisionFullTextSearchRequest
{
    public DateTime? ApplicationSubmittedDateGreaterThan { get; set; }

    public DateTime? ApplicationSubmittedDateLessThan { get; set; }

    public DateTime? DecisionDateGreaterThan { get; set; }

    public DateTime? DecisionDateLessThan { get; set; }

    public DateTime? PreviousHearingDateGreaterThan { get; set; }

    public DateTime? PreviousHearingDateLessThan { get; set; }
}