using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using CM.Common.Utilities;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Entities;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Repositories.UnitOfWork;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Services.AdHocReport
{
    public class AdHocReportService : AdHocServiceBase, IAdHocReportService
    {
        public AdHocReportService(IMapper mapper, IUnitOfWork unitOfWork)
            : base(unitOfWork, mapper)
        {
        }

        public async Task<AdHocReportEmailResponse> CreateAsync(AdHocReportEmailRequest adHocReportEmailRequest)
        {
            var newReportEmail = MapperService.Map<AdHocReportEmailRequest, Models.AdHocReport>(adHocReportEmailRequest);
            var reportResult = await UnitOfWork.AdHocReportRepository.InsertAsync(newReportEmail);
            var result = await UnitOfWork.Complete();
            if (result.CheckSuccess())
            {
                return MapperService.Map<Models.AdHocReport, AdHocReportEmailResponse>(reportResult);
            }

            return null;
        }

        public async Task<AdHocReportAttachmentResponse> CreateAttachmentAsync(int adHocReportId, AdHocReportAttachmentRequest adHocReportAttachmentRequest)
        {
            var newReportAttachment = MapperService.Map<AdHocReportAttachmentRequest, Models.AdHocReportAttachment>(adHocReportAttachmentRequest);
            newReportAttachment.AdHocReportId = adHocReportId;
            var reportResult = await UnitOfWork.AdHocReportAttachmentRepository.InsertAsync(newReportAttachment);
            var result = await UnitOfWork.Complete();
            if (result.CheckSuccess())
            {
                return MapperService.Map<Models.AdHocReportAttachment, AdHocReportAttachmentResponse>(reportResult);
            }

            return null;
        }

        public async Task<bool> DeleteAsync(int adHocReportId)
        {
            var adHocReport = await UnitOfWork.AdHocReportRepository.GetByIdAsync(adHocReportId);
            if (adHocReport != null)
            {
                adHocReport.IsDeleted = true;
                UnitOfWork.AdHocReportRepository.Attach(adHocReport);
                var result = await UnitOfWork.Complete();
                return result.CheckSuccess();
            }

            return false;
        }

        public async Task<bool> DeleteAttachmentAsync(int adHocReportAttachmentId)
        {
            var adHocReportAttachment = await UnitOfWork.AdHocReportAttachmentRepository.GetByIdAsync(adHocReportAttachmentId);
            if (adHocReportAttachment != null)
            {
                adHocReportAttachment.IsDeleted = true;
                UnitOfWork.AdHocReportAttachmentRepository.Attach(adHocReportAttachment);
                var result = await UnitOfWork.Complete();
                return result.CheckSuccess();
            }

            return false;
        }

        public async Task<AdHocReportEmailGetResponse> GetAdHocReportAsync(int adHocReportId)
        {
            var adHocReport = await UnitOfWork.AdHocReportRepository.GetAdHocReportWithChildren(adHocReportId);
            if (adHocReport != null)
            {
                return MapperService.Map<Models.AdHocReport, AdHocReportEmailGetResponse>(adHocReport);
            }

            return null;
        }

        public async Task<List<AdHocReportEmailGetResponse>> GetAdHocReports(AdHocReportGetFilter filter)
        {
            var adHocReports = await UnitOfWork.AdHocReportRepository.GetAdHocReports(filter);
            return MapperService.Map<List<Models.AdHocReport>, List<AdHocReportEmailGetResponse>>(adHocReports);
        }

        public async Task<DateTime?> GetLastModifiedDateAsync(object id)
        {
            var lastModifiedDate = await UnitOfWork.AdHocReportRepository.GetLastModifiedDate((int)id);

            return lastModifiedDate;
        }

        public async Task<Models.AdHocReport> GetNoTrackingAdHocReportAsync(long adHocReportId)
        {
            var adHocReport = await UnitOfWork
                .AdHocReportRepository
                .GetAdHocReportWithChildren(adHocReportId);
            return adHocReport;
        }

        public async Task<Models.AdHocReportAttachment> GetNoTrackingAdHocReportAttachmentAsync(long adHocReportAttachmentId)
        {
            var adHocReportAttachment = await UnitOfWork
                .AdHocReportAttachmentRepository
                .GetNoTrackingByIdAsync(x => x.AdHocReportAttachmentId == adHocReportAttachmentId);
            return adHocReportAttachment;
        }

        public async Task<bool?> IsLastAttachment(long adHocReportAttachmentId)
        {
            var attachment = await UnitOfWork
                .AdHocReportAttachmentRepository
                .GetNoTrackingByIdAsync(x => x.AdHocReportAttachmentId == adHocReportAttachmentId);

            if (attachment == null)
            {
                return null;
            }

            var report = await UnitOfWork.AdHocReportRepository.GetAdHocReportWithChildren(attachment.AdHocReportId);

            if (report.IsActive && report.AdHocReportAttachments.Count < 2)
            {
                return true;
            }

            return false;
        }

        public async Task<Models.AdHocReport> PatchAsync(Models.AdHocReport adHocReport)
        {
            UnitOfWork.AdHocReportRepository.Attach(adHocReport);
            var result = await UnitOfWork.Complete();
            if (result.CheckSuccess())
            {
                return adHocReport;
            }

            return null;
        }

        public async Task<Models.AdHocReportAttachment> PatchAttachmentAsync(Models.AdHocReportAttachment adHocReportAttachment)
        {
            UnitOfWork.AdHocReportAttachmentRepository.Attach(adHocReportAttachment);
            var result = await UnitOfWork.Complete();
            if (result.CheckSuccess())
            {
                return adHocReportAttachment;
            }

            return null;
        }
    }
}
