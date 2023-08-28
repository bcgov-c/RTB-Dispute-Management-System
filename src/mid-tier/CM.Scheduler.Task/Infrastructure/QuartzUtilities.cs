using System;
using CM.Scheduler.Task.Jobs;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Quartz;
using Quartz.Impl.Matchers;
using Serilog;

namespace CM.Scheduler.Task.Infrastructure;

public static class QuartzUtilities
{
    public static void AddJobAndTrigger<TJob>(this IServiceCollectionQuartzConfigurator quartz, string cronSchedule, string jobName)
        where TJob : IJob
    {
        if (CronExpression.IsValidExpression(cronSchedule) == false)
        {
            Log.Fatal("Invalid cron job expression {CronJob} for {JobName}", cronSchedule, jobName);
            return;
        }

        if (string.IsNullOrWhiteSpace(cronSchedule))
        {
            throw new ArgumentNullException($"Configuration for {jobName} is missing");
        }

        if (string.IsNullOrEmpty(jobName))
        {
            throw new Exception($"jobName should not be empty");
        }

        var jobKey = new JobKey(jobName);
        quartz.AddJob<TJob>(opts => opts.WithIdentity(jobKey));

        quartz.AddTrigger(opts => opts
            .ForJob(jobKey)
            .WithIdentity(jobName + "-trigger")
            .WithCronSchedule(cronSchedule));
    }

    public static async System.Threading.Tasks.Task StartScheduledJob<TJob>(
        this IScheduler scheduler,
        string cronSchedule,
        string jobName = null,
        JobDataMap dataMap = null)
        where TJob : IJob
    {
        if (CronExpression.IsValidExpression(cronSchedule) == false)
        {
            Log.Fatal("Invalid cron job expression {CronJob} for {JobName}", cronSchedule, jobName);
            return;
        }

        if (string.IsNullOrWhiteSpace(cronSchedule))
        {
            throw new ArgumentNullException($"Configuration for {jobName} is missing");
        }

        jobName ??= typeof(TJob).FullName;

        if (string.IsNullOrWhiteSpace(jobName))
        {
            throw new ArgumentNullException(nameof(jobName));
        }

        var job = JobBuilder.Create<TJob>()
            .WithIdentity(jobName)
            .SetJobData(dataMap ?? new JobDataMap())
            .Build();

        var trigger = TriggerBuilder.Create()
            .WithIdentity(jobName)
            .StartNow()
            .WithCronSchedule(cronSchedule)
            .Build();

        await scheduler.ScheduleJob(job, trigger);
    }

    public static IServiceCollection UseQuartz(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddQuartz(q =>
        {
            q.UseMicrosoftDependencyInjectionJobFactory();
            q.AddJobListener<JobListener>();

            q.AddJobAndTrigger<ParticipatoryHearingReminderJob>(configuration["Scheduler:HearingReminderCronSchedule"],
                "HearingReminderJob");

            q.AddJobAndTrigger<ParticipatoryApplicantEvidenceReminderJob>(
                configuration["Scheduler:ApplicantEvidenceReminderCronSchedule"], "ApplicantEvidenceReminderJob");

            q.AddJobAndTrigger<ParticipatoryRespondentEvidenceReminderJob>(
                configuration["Scheduler:RespondentEvidenceReminderCronSchedule"], "RespondentEvidenceReminderJob");

            q.AddJobAndTrigger<ParticipatoryEmergRespondentEvidenceReminderPeriodJob>(
                configuration["Scheduler:RespondentEmergEvidenceReminderCronSchedule"], "RespondentEmergEvidenceReminderJob");

            q.AddJobAndTrigger<ReconciliationReportJob>(configuration["Scheduler:ReconciliationReportCronSchedule"],
                "ReconciliationReportJob");

            q.AddJobAndTrigger<DisputeAbandonedDueToApplicantInactionJob>(
                configuration["Scheduler:AbandonedDisputesNotificationSchedule"], "AbandonedDisputesNotificationJob");

            q.AddJobAndTrigger<DisputeAbandonedForNoPaymentJob>(configuration["Scheduler:DisputeAbandonedForNoPaymentSchedule"],
                "DisputeAbandonedForNoPaymentJob");

            q.AddJobAndTrigger<FactDisputeSummaryJob>(configuration["Scheduler:FactDisputeSummarySchedule"], "FactDisputeSummaryJob");
            q.AddJobAndTrigger<DisputeAbandonedForNoServiceJob>(configuration["Scheduler:DisputeAbandonedForNoPaymentSchedule"],
                "DisputeAbandonedForNoServiceJob");

            q.AddJobAndTrigger<ColdStorageScheduleJob>(configuration["Scheduler:ColdStorageSchedule"], "ColdStorageScheduleJob");
            q.AddJobAndTrigger<FactTimeStatisticsJob>(configuration["Scheduler:FactTimeStatisticsSchedule"], "FactTimeStatisticsJob");
            q.AddJobAndTrigger<FactIntakeProcessingJob>(configuration["Scheduler:FactIntakeProcessingSchedule"],
                "FactIntakeProcessingJob");

            q.AddJobAndTrigger<FactResolutionServiceJob>(configuration["Scheduler:FactResolutionServiceSchedule"],
                "FactResolutionServiceJob");

            q.AddJobAndTrigger<FactHearingSummaryJob>(configuration["Scheduler:FactHearingSummarySchedule"], "FactHearingSummaryJob");
            q.AddJobAndTrigger<AricParticipatoryApplicantEvidenceReminderJob>(
                configuration["Scheduler:AricApplicantEvidenceReminderCronSchedule"], "AricApplicantEvidenceReminderJob");

            q.AddJobAndTrigger<PfrParticipatoryApplicantEvidenceReminderJob>(
                configuration["Scheduler:PfrApplicantEvidenceReminderCronSchedule"], "PfrApplicantEvidenceReminderJob");

            q.AddJobAndTrigger<HearingRecordingTransferJob>(configuration["Scheduler:HearingRecordingTransferCronSchedule"],
                "HearingRecordingTransferJob");

            q.AddJobAndTrigger<SendPreferredDateEmailsJob>(configuration["Scheduler:SendPreferredDateEmailsCronSchedule"],
                "SendPreferredDateEmailsJob");

            q.AddJobAndTrigger<RetryErrorSendEmailsJob>(configuration["Scheduler:RetryErrorSendEmailsCronSchedule"],
                "RetryErrorSendEmailsJob");

            q.AddJobAndTrigger<ArsDeclarationDeadlineReminderJob>(configuration["Scheduler:ArsDeclarationDeadlineReminderSchedule"],
                "ArsDeclarationDeadlineReminderJob");

            q.AddJobAndTrigger<ArsDeclarationDeadlineMissedJob>(configuration["Scheduler:ArsDeclarationDeadlineMissedSchedule"],
                "ArsDeclarationDeadlineMissedJob");

            q.AddJobAndTrigger<ArsReinstatementDeadlineReminderJob>(
                configuration["Scheduler:ArsReinstatementDeadlineReminderSchedule"], "ArsReinstatementDeadlineReminderJob");

            q.AddJobAndTrigger<ArsReinstatementDeadlineMissedJob>(configuration["Scheduler:ArsReinstatementDeadlineMissedSchedule"],
                "ArsReinstatementDeadlineMissedJob");

            q.AddJobAndTrigger<FactIssueOutcomeJob>(configuration["Scheduler:FactIssueOutcomeSchedule"], "FactIssueOutcomeJob");

            q.AddJobAndTrigger<MhvAppCnFirstScheduleJob>(
                configuration["Scheduler:MhvAppCnFirstSchedule"], "MhvAppCnFirstScheduleJob");

            q.AddJobAndTrigger<MhvAppNotLinkedFirstScheduleJob>(
                configuration["Scheduler:MhvAppNotLinkedFirstSchedule"], "MhvAppNotLinkedFirstScheduleJob");

            q.AddJobAndTrigger<MhvAppLinkedFirstScheduleJob>(
                configuration["Scheduler:MhvAppLinkedFirstSchedule"], "MhvAppLinkedFirstScheduleJob");

            q.AddJobAndTrigger<MhvAppCnFinalScheduleJob>(
                configuration["Scheduler:MhvAppCnFinalSchedule"], "MhvAppCnFinalScheduleJob");

            q.AddJobAndTrigger<MhvAppNotLinkedFinalScheduleJob>(
                configuration["Scheduler:MhvAppNotLinkedFinalSchedule"], "MhvAppNotLinkedFinalScheduleJob");

            q.AddJobAndTrigger<MhvAppLinkedFinalScheduleJob>(
                configuration["Scheduler:MhvAppLinkedFinalSchedule"], "MhvAppLinkedFinalScheduleJob");
        });

        services.AddQuartzServer(opt => { opt.WaitForJobsToComplete = true; });

        return services;
    }
}