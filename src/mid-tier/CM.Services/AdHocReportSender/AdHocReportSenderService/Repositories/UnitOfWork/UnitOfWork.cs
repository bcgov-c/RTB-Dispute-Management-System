using System;
using System.Data.Common;
using System.Diagnostics;
using System.Threading.Tasks;
using CM.Services.AdHocReportSender.AdHocReportSenderService.ExternalContexts;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Repositories.AdHocDlReport;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Repositories.AdHocReport;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Repositories.AdHocReportAttachment;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Repositories.UnitOfWork
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AdHocReportContext _adHocContext;
        private readonly RtbDmsContext _rtbDmsContext;
        private readonly IAdHocDlReportRepository _adHocDlReportRepository = null;
        private readonly IAdHocReportRepository _adHocReportRepository = null;
        private readonly IAdHocReportAttachmentRepository _adHocReportAttachmentRepository = null;

        public UnitOfWork(AdHocReportContext adHocContext, RtbDmsContext rtbDmsContext)
        {
            _adHocContext = adHocContext;
            _rtbDmsContext = rtbDmsContext;
        }

        public IAdHocDlReportRepository AdHocDlReportRepository => _adHocDlReportRepository ?? new AdHocDlReportRepository(_adHocContext, _rtbDmsContext);

        public IAdHocReportRepository AdHocReportRepository => _adHocReportRepository ?? new AdHocReportRepository(_adHocContext, _rtbDmsContext);

        public IAdHocReportAttachmentRepository AdHocReportAttachmentRepository => _adHocReportAttachmentRepository ?? new AdHocReportAttachmentRepository(_adHocContext, _rtbDmsContext);

        public async Task<int> Complete(bool withNoTracking = false)
        {
            await using var scope = await _adHocContext.Database.BeginTransactionAsync();

            try
            {
                var res = await _adHocContext.SaveChangesAsync();

                await scope.CommitAsync();

                return res;
            }
            catch (DbException ex)
            {
                await scope.RollbackAsync();
                Debug.WriteLine(ex.Message);

                return await Task.FromResult(ex.ErrorCode);
            }
            catch (InvalidOperationException ex)
            {
                Debug.WriteLine(ex.Message);

                throw;
            }
            catch (DbUpdateConcurrencyException ex)
            {
                Debug.WriteLine(ex.Message);

                throw;
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.Message);

                throw;
            }
        }

        public IDbContextTransaction BeginTransaction()
        {
            return _adHocContext.Database.BeginTransaction();
        }
    }
}
