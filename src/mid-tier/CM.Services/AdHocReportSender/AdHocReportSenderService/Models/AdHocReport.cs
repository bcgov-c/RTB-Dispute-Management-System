using System;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Models;

public class AdHocReport
{
    public long AdHocReportId { get; set; }

    public string Description { get; set; }

    public bool IsActive { get; set; }

    public string EmailSubject { get; set; }

    public string EmailBody { get; set; }

    public string EmailFrom { get; set; }

    public string EmailTo { get; set; }

    public string CronJob { get; set; }

    public DateTime CreatedDate { get; set; }

    public virtual AdHocReportAttachment AdHocReportAttachment { get; set; }

    public virtual AdHocReportTracking AdHocReportsTracking { get; set; }
}