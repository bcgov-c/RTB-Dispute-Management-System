using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Entities;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Services.AdHocDlReport
{
    public interface IAdHocDlReportService : IAdHocServiceBase
    {
        Task<AdHocDlReportResponse> CreateAsync(AdHocDlReportRequest adHocDlReportRequest);

        Task<Models.AdHocDlReport> GetNoTrackingAdHocDlReportAsync(long adHocDlReportId);

        Task<Models.AdHocDlReport> PatchAsync(Models.AdHocDlReport adHocDlReport);

        Task<bool> ExcelTemplateExists(int excelTemplateId);

        Task<bool> DeleteAsync(int adHocDlReportId);

        Task<AdHocDlReportResponse> GetAdHocDlReportAsync(int adHocDlReportId);

        Task<List<AdHocDlReportResponse>> GetAdHocDlReports(int count, int index, AdHocGetFilter filter);
    }
}
