using System;

namespace CM.Business.Entities.Models.PostedDecision;

public class PostedDecisionSearchRequest
{
    public DateTime? ApplicationSubmittedDateGreaterThan { get; set; }

    public DateTime? ApplicationSubmittedDateLessThan { get; set; }

    public DateTime? DecisionDateGreaterThan { get; set; }

    public DateTime? DecisionDateLessThan { get; set; }

    public DateTime? PreviousHearingDateGreaterThan { get; set; }

    public DateTime? PreviousHearingDateLessThan { get; set; }

    public int? DisputeType { get; set; }

    public int? DisputeSubType { get; set; }

    public int? TenancyEnded { get; set; }

    public int? DisputeProcess { get; set; }

    public int[] IncludedClaimIds { get; set; }

    public int[] ExcludedClaimIds { get; set; }

    public int? HearingAttendance { get; set; }
}