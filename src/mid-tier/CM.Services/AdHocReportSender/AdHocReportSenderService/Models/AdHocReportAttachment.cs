using System;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Models;

public class AdHocReportAttachment
{
    public long AdHocReportAttachmentId { get; set; }

    public long AdHocReportId { get; set; }

    public string Description { get; set; }

    public string QueryForName { get; set; }

    public string QueryForAttachment { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedDate { get; set; }
}