using System.Collections.Generic;
using CM.Common.Utilities;
using Newtonsoft.Json;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Entities;

public class AdHocReportRequest
{
    [JsonProperty("use_excel_template")]
    public bool UseExcelTemplate { get; set; }

    [JsonProperty("content_disposition")]
    public ContentDispositionType ContentDispositionType { get; set; }

    [JsonProperty("parameters")]
    public List<dynamic> Parameters { get; set; }
}