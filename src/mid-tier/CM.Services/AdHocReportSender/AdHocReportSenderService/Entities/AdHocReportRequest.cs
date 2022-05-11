using Newtonsoft.Json;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Entities;

public class AdHocReportRequest
{
    [JsonProperty("use_excel_template")]
    public bool UseExcelTemplate { get; set; }
}