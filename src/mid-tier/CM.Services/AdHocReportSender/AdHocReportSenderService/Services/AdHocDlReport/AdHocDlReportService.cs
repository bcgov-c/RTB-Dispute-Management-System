using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using CM.Common.Utilities;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Entities;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Repositories.UnitOfWork;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Services.AdHocDlReport
{
    public class AdHocDlReportService : AdHocServiceBase, IAdHocDlReportService
    {
        public AdHocDlReportService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
        {
        }

        public async Task<AdHocDlReportResponse> CreateAsync(AdHocDlReportRequest adHocDlReportRequest)
        {
            var newReport = MapperService.Map<AdHocDlReportRequest, Models.AdHocDlReport>(adHocDlReportRequest);
            var reportResult = await UnitOfWork.AdHocDlReportRepository.InsertAsync(newReport);
            var result = await UnitOfWork.Complete();
            if (result.CheckSuccess())
            {
                return MapperService.Map<Models.AdHocDlReport, AdHocDlReportResponse>(reportResult);
            }

            return null;
        }

        public async Task<bool> DeleteAsync(int adHocDlReportId)
        {
            var adHocDlReport = await UnitOfWork.AdHocDlReportRepository.GetByIdAsync(adHocDlReportId);
            if (adHocDlReport != null)
            {
                adHocDlReport.IsDeleted = true;
                UnitOfWork.AdHocDlReportRepository.Attach(adHocDlReport);
                var result = await UnitOfWork.Complete();
                return result.CheckSuccess();
            }

            return false;
        }

        public async Task<bool> ExcelTemplateExists(int excelTemplateId)
        {
            var exists = await UnitOfWork.AdHocDlReportRepository.IsExcelTemplateExists(excelTemplateId);
            return exists;
        }

        public async Task<AdHocDlReportResponse> GetAdHocDlReportAsync(int adHocDlReportId)
        {
            var adHocDlReport = await UnitOfWork.AdHocDlReportRepository.GetByIdAsync(adHocDlReportId);
            if (adHocDlReport != null)
            {
                return MapperService.Map<Models.AdHocDlReport, AdHocDlReportResponse>(adHocDlReport);
            }

            return null;
        }

        public async Task<List<AdHocDlReportResponse>> GetAdHocDlReports(int count, int index, AdHocGetFilter filter)
        {
            if (count == 0)
            {
                count = Pagination.DefaultPageSize;
            }

            var adHocDlReports = await UnitOfWork.AdHocDlReportRepository.GetAdHocDlReports(count, index, filter);
            return MapperService.Map<List<Models.AdHocDlReport>, List<AdHocDlReportResponse>>(adHocDlReports);
        }

        public async Task<DateTime?> GetLastModifiedDateAsync(object id)
        {
            var lastModifiedDate = await UnitOfWork.AdHocDlReportRepository.GetLastModifiedDate((int)id);

            return lastModifiedDate;
        }

        public async Task<Models.AdHocDlReport> GetNoTrackingAdHocDlReportAsync(long adHocDlReportId)
        {
            var adHocDlReport = await UnitOfWork.AdHocDlReportRepository.GetNoTrackingByIdAsync(
            r => r.AdHocDlReportId == adHocDlReportId);
            return adHocDlReport;
        }

        public async Task<Models.AdHocDlReport> PatchAsync(Models.AdHocDlReport originalAdHocDlReport)
        {
            UnitOfWork.AdHocDlReportRepository.Attach(originalAdHocDlReport);
            var result = await UnitOfWork.Complete();
            if (result.CheckSuccess())
            {
                return originalAdHocDlReport;
            }

            return null;
        }
    }
}
