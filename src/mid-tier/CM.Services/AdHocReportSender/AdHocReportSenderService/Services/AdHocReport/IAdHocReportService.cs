using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Entities;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Models;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Services.AdHocReport
{
    public interface IAdHocReportService : IAdHocServiceBase
    {
        Task<AdHocReportEmailResponse> CreateAsync(AdHocReportEmailRequest adHocReportEmailRequest);

        Task<Models.AdHocReport> GetNoTrackingAdHocReportAsync(long adHocReportId);

        Task<Models.AdHocReport> PatchAsync(Models.AdHocReport adHocReport);

        Task<bool> DeleteAsync(int adHocReportId);

        Task<AdHocReportEmailGetResponse> GetAdHocReportAsync(int adHocReportId);

        Task<AdHocReportAttachmentResponse> CreateAttachmentAsync(int adHocReportId, AdHocReportAttachmentRequest adHocReportAttachmentRequest);

        Task<AdHocReportAttachment> GetNoTrackingAdHocReportAttachmentAsync(long adHocReportAttachmentId);

        Task<AdHocReportAttachment> PatchAttachmentAsync(AdHocReportAttachment adHocReportAttachment);

        Task<bool> DeleteAttachmentAsync(int adHocReportAttachmentId);

        Task<bool?> IsLastAttachment(long adHocReportAttachmentId);

        Task<List<AdHocReportEmailGetResponse>> GetAdHocReports(AdHocReportGetFilter filter);
    }
}
