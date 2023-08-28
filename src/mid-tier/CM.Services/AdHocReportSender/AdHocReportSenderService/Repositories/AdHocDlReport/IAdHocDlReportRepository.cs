using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Entities;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Repositories.AdHocDlReport
{
    public interface IAdHocDlReportRepository : IAdHocRepositoryBase<Models.AdHocDlReport>
    {
        Task<DateTime?> GetLastModifiedDate(int id);

        Task<bool> IsExcelTemplateExists(int excelTemplateId);

        Task<List<Models.AdHocDlReport>> GetAdHocDlReports(int count, int index, AdHocGetFilter filter);
    }
}
