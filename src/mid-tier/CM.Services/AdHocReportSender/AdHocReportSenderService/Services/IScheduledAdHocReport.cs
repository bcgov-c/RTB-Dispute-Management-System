using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Entities;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Models;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Services;

public interface IScheduledAdHocReport
{
    Task RunAdHocReport(Models.AdHocReport adHocReport);

    Task<byte[]> GetAdHocReportBytes(AdHocDlReportResponse adHocDlReport, AdHocReportRequest request, List<dynamic> parameters);

    Task<List<AdHocDlReportResponse>> GetListAsync();

    Task<AdHocDlReportResponse> GetById(int id);

    string GetAdHocReportName(AdHocDlReportResponse adHocDlReport);

    Task<CommonFile> GetTemplateFile(AdHocDlReportResponse adHocDlReport);

    Task<CommonFile> GetTemplateFile(int? excelTemplateId);
}