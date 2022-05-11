using System;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Models;

public class AdHocDlReport
{
    public long AdHocDlReportId { get; set; }

    public string Title { get; set; }

    public string Description { get; set; }

    public string HtmlDataDictionary { get; set; }

    public ReportType Type { get; set; }

    public ReportSubType SubType { get; set; }

    public byte? ReportUserGroup { get; set; }

    public string QueryForName { get; set; }

    public string QueryForReport { get; set; }

    public bool? ExcelTemplateExists { get; set; }

    public int? ExcelTemplateId { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedDate { get; set; }
}