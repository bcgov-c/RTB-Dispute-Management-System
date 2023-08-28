using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Entities;
using CM.Services.AdHocReportSender.AdHocReportSenderService.ExternalContexts;
using Microsoft.EntityFrameworkCore;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Repositories.AdHocDlReport
{
    public class AdHocDlReportRepository : AdHocRepositoryBase<Models.AdHocDlReport>, IAdHocDlReportRepository
    {
        public AdHocDlReportRepository(AdHocReportContext adHocContext, RtbDmsContext rtbDmsContext)
            : base(adHocContext, rtbDmsContext)
        {
        }

        public async Task<List<Models.AdHocDlReport>> GetAdHocDlReports(int count, int index, AdHocGetFilter filter)
        {
            var predicate = PredicateBuilder.True<Models.AdHocDlReport>();

            if (filter.ReportType != null)
            {
                predicate = predicate.And(x => filter.ReportType.Contains(x.Type));
            }

            if (filter.ReportSubType != null)
            {
                predicate = predicate.And(x => filter.ReportSubType.Contains(x.SubType));
            }

            if (filter.ReportUserGroup != null)
            {
                predicate = predicate.And(x => filter.ReportUserGroup.Contains(x.ReportUserGroup));
            }

            if (filter.TargetDatabase != null)
            {
                predicate = predicate.And(x => filter.TargetDatabase.Contains(x.TargetDatabase));
            }

            if (filter.IsActive != null)
            {
                predicate = predicate.And(x => x.IsActive == filter.IsActive.Value);
            }

            var adHocDlReports = await AdHocContext.AdHocDlReports
                .Where(predicate)
                .ApplyPaging(count, index)
                .ToListAsync();

            return adHocDlReports;
        }

        public async Task<DateTime?> GetLastModifiedDate(int id)
        {
            var dates = await AdHocContext.AdHocDlReports
            .Where(c => c.AdHocDlReportId == id)
            .Select(d => d.ModifiedDate)
            .ToListAsync();

            return dates?.FirstOrDefault();
        }

        public async Task<bool> IsExcelTemplateExists(int excelTemplateId)
        {
            var templateExists = await RtbDmsContext.CommonFiles.AnyAsync(x => x.CommonFileId == excelTemplateId && x.FileType == 5);
            return templateExists;
        }
    }
}
