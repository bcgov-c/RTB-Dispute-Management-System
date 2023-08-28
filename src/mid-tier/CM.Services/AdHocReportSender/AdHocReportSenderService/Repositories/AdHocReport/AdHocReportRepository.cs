using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Entities;
using CM.Services.AdHocReportSender.AdHocReportSenderService.ExternalContexts;
using Microsoft.EntityFrameworkCore;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Repositories.AdHocReport
{
    public class AdHocReportRepository : AdHocRepositoryBase<Models.AdHocReport>, IAdHocReportRepository
    {
        public AdHocReportRepository(AdHocReportContext adHocContext, RtbDmsContext rtbDmsContext)
            : base(adHocContext, rtbDmsContext)
        {
        }

        public async Task<List<Models.AdHocReport>> GetAdHocReports(AdHocReportGetFilter filter)
        {
            var predicate = PredicateBuilder.True<Models.AdHocReport>();

            if (filter.ReportType != null)
            {
                predicate = predicate.And(x => filter.ReportType.Contains((byte)x.ReportType));
            }

            if (filter.ReportSubType != null)
            {
                predicate = predicate.And(x => filter.ReportSubType.Contains((byte)x.ReportSubType));
            }

            if (filter.ReportUserGroup != null)
            {
                predicate = predicate.And(x => filter.ReportUserGroup.Contains(x.ReportUserGroup));
            }

            if (filter.IsActive != null)
            {
                predicate = predicate.And(x => x.IsActive == filter.IsActive.Value);
            }

            var adHocReports = await AdHocContext.AdHocReports
                .Where(predicate)
                .ToListAsync();

            return adHocReports;
        }

        public async Task<Models.AdHocReport> GetAdHocReportWithChildren(long adHocReportId)
        {
            var adHocReport = await AdHocContext
                .AdHocReports
                .Include(x => x.AdHocReportAttachments)
                .FirstOrDefaultAsync(x => x.AdHocReportId == adHocReportId);

            return adHocReport;
        }

        public async Task<DateTime?> GetLastModifiedDate(int id)
        {
            var dates = await AdHocContext.AdHocReports
            .Where(c => c.AdHocReportId == id)
            .Select(d => d.ModifiedDate)
            .ToListAsync();

            return dates?.FirstOrDefault();
        }
    }
}
