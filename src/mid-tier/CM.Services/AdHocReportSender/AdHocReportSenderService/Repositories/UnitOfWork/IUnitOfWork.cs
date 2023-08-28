using System.Threading.Tasks;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Repositories.AdHocDlReport;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Repositories.AdHocReport;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Repositories.AdHocReportAttachment;
using Microsoft.EntityFrameworkCore.Storage;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Repositories.UnitOfWork
{
    public interface IUnitOfWork
    {
        IAdHocDlReportRepository AdHocDlReportRepository { get; }

        IAdHocReportRepository AdHocReportRepository { get; }

        IAdHocReportAttachmentRepository AdHocReportAttachmentRepository { get; }

        Task<int> Complete(bool withNoTracking = false);

        IDbContextTransaction BeginTransaction();
    }
}
