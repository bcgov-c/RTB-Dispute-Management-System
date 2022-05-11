using System.Threading.Tasks;

namespace CM.Business.Services.ScheduledHearingReminder;

public interface IScheduledReminderService
{
    Task<bool> RunParticipatoryHearingReminderNotifications();

    Task<bool> ParticipatoryApplicantEvidenceReminderNotifications();

    Task<bool> ParticipatoryRespondentEvidenceReminderNotifications();

    Task<bool> ParticipatoryEmergRespondentEvidenceReminderPeriodNotifications();
}