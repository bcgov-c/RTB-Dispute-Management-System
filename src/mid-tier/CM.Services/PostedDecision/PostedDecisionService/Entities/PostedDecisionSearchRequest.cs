using System;
using Newtonsoft.Json;

namespace CM.Services.PostedDecision.PostedDecisionDataService.Entities;

public class PostedDecisionSearchRequest
{
    [JsonProperty("posted_file_number")]
    public int? FileNumber { get; set; }

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

    public int[] IncludedClaimCodes { get; set; }

    public int[] ExcludedClaimCodes { get; set; }

    public int? HearingAttendance { get; set; }

    public bool? NoteWorthy { get; set; }

    public string BusinessNames { get; set; }
}