using System;
using System.Threading.Tasks;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Services
{
    public interface IAdHocServiceBase
    {
        Task<DateTime?> GetLastModifiedDateAsync(object id);
    }
}
