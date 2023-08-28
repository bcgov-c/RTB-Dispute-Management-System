using System.Collections.Generic;
using CM.Common.Utilities;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Models;

public class AdHocReport : CommonModel
{
    public long AdHocReportId { get; set; }

    public string Description { get; set; }

    public ReportType? ReportType { get; set; }

    public ReportSubType? ReportSubType { get; set; }

    public byte? ReportUserGroup { get; set; }

    public bool IsActive { get; set; }

    public bool? IsDeleted { get; set; }

    public string EmailSubject { get; set; }

    public string EmailBody { get; set; }

    public string EmailFrom { get; set; }

    public string EmailTo { get; set; }

    public string CronJob { get; set; }

    public virtual ICollection<AdHocReportAttachment> AdHocReportAttachments { get; set; }

    public virtual AdHocReportTracking AdHocReportsTracking { get; set; }
}