using System;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Models;
using Newtonsoft.Json;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Entities;

public class AdHocDlReportResponse
{
    [JsonProperty("adhoc_dl_report_id")]
    public long AdHocDlReportId { get; set; }

    [JsonProperty("title")]
    public string Title { get; set; }

    [JsonProperty("description")]
    public string Description { get; set; }

    [JsonProperty("html_data_dictionary")]
    public string HtmlDataDictionary { get; set; }

    [JsonProperty("type")]
    public ReportType Type { get; set; }

    [JsonProperty("sub_type")]
    public ReportSubType SubType { get; set; }

    [JsonProperty("user_group")]
    public byte? ReportUserGroup { get; set; }

    [JsonProperty("query_for_name")]
    public string QueryForName { get; set; }

    [JsonProperty("query_for_report")]
    public string QueryForReport { get; set; }

    [JsonProperty("is_active")]
    public bool IsActive { get; set; }

    [JsonProperty("created_date")]
    public DateTime CreatedDate { get; set; }
}