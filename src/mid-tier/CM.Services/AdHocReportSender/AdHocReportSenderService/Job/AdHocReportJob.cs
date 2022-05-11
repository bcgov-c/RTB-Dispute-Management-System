using System;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Models;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Services;
using Microsoft.Extensions.DependencyInjection;
using Quartz;
using Serilog;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Job;

[DisallowConcurrentExecution]
public class AdHocReportJob : JobBase
{
    private const string Identity = "adhoc-report-job";

    public AdHocReportJob(IServiceScopeFactory serviceScopeFactory)
    {
        ServiceScopeFactory = serviceScopeFactory;
    }

    private IServiceScopeFactory ServiceScopeFactory { get; }

    public override async System.Threading.Tasks.Task Execute(IJobExecutionContext context)
    {
        try
        {
            using var scope = ServiceScopeFactory.CreateScope();

            var adHocReport = context.JobDetail.JobDataMap.Get("AdHocReport") as AdHocReport;
            var service = scope.ServiceProvider.GetRequiredService<IScheduledAdHocReport>();
            await service.RunAdHocReport(adHocReport);

            Log.Information(Identity + " succeeded");
        }
        catch (Exception e)
        {
            throw new JobExecutionException(e);
        }
    }
}