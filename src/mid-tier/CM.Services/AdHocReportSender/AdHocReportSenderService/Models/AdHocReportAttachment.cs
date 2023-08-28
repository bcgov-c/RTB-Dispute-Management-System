using CM.Common.Utilities;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Models;

public class AdHocReportAttachment : CommonModel
{
    public long AdHocReportAttachmentId { get; set; }

    public long AdHocReportId { get; set; }

    public AdHocReport AdHocReport { get; set; }

    public TargetDatabase TargetDatabase { get; set; }

    public string Description { get; set; }

    public string QueryForName { get; set; }

    public string QueryForAttachment { get; set; }

    public bool IsActive { get; set; }

    public bool? IsDeleted { get; set; }

    public bool? ExcelTemplateExists { get; set; }

    public int? ExcelTemplateId { get; set; }
}