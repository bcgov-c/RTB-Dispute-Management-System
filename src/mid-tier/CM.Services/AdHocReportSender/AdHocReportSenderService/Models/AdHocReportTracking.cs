using System;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Models;

public class AdHocReportTracking
{
    public long AdHocReportTrackingId { get; set; }

    public long AdHocReportId { get; set; }

    public DateTime? SentDate { get; set; }

    public AdHocReportStatus Status { get; set; }
}