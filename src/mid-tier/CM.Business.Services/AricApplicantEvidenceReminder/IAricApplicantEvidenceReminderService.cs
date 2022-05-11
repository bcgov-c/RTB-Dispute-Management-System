using System.Threading.Tasks;

namespace CM.Business.Services.AricApplicantEvidenceReminder;

public interface IAricApplicantEvidenceReminderService
{
    Task<bool> Handle();
}