using System.ComponentModel.DataAnnotations.Schema;
using CM.Common.Utilities;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Models;

public class AdHocDlReport : CommonModel
{
    public long AdHocDlReportId { get; set; }

    public string Title { get; set; }

    public string Description { get; set; }

    public string HtmlDataDictionary { get; set; }

    public TargetDatabase? TargetDatabase { get; set; }

    public ReportType Type { get; set; }

    public ReportSubType SubType { get; set; }

    public byte? ReportUserGroup { get; set; }

    public string QueryForName { get; set; }

    public string QueryForReport { get; set; }

    public bool? ExcelTemplateExists { get; set; }

    public int? ExcelTemplateId { get; set; }

    public bool IsActive { get; set; }

    public bool? IsDeleted { get; set; }

    [Column(TypeName = "json")]
    public string ParameterConfig { get; set; }
}