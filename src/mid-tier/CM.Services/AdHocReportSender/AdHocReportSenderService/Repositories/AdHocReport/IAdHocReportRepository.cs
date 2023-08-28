using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Entities;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Repositories.AdHocReport
{
    public interface IAdHocReportRepository : IAdHocRepositoryBase<Models.AdHocReport>
    {
        Task<DateTime?> GetLastModifiedDate(int id);

        Task<Models.AdHocReport> GetAdHocReportWithChildren(long adHocReportId);

        Task<List<Models.AdHocReport>> GetAdHocReports(AdHocReportGetFilter filter);
    }
}
