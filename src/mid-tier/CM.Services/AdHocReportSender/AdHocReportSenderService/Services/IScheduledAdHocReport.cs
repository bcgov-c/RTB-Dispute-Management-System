using System.Threading.Tasks;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Models;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Services;

public interface IScheduledAdHocReport
{
    Task RunAdHocReport(AdHocReport adHocReport);
}