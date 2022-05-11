using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace CM.Data.Model.HearingReport;

[NotMapped]
public class ArbitrationScheduleHearing
{
    public int DisputeHearingId { get; set; }

    public int HearingId { get; set; }

    public Guid DisputeGuid { get; set; }

    public int? DmsFileNumber { get; set; }

    public string OtherFileNumber { get; set; }

    public string FileRole { get; set; }

    public string LinkType { get; set; }

    public string Urgency { get; set; }

    public string Arbitrator { get; set; }

    public string HearingDate { get; set; }

    public string HearingTime { get; set; }

    public string ModeratorCode { get; set; }

    public string WebPortalLogin { get; set; }
}