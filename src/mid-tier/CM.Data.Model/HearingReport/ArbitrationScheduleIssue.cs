using System.ComponentModel.DataAnnotations.Schema;

namespace CM.Data.Model.HearingReport;

[NotMapped]
public class ArbitrationScheduleIssue
{
    public int? FileNumber { get; set; }

    public byte? IssueCode { get; set; }

    public string IssueTitle { get; set; }
}