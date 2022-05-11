using System.Threading.Tasks;

namespace CM.Business.Services.PfrApplicantEvidenceReminder;

public interface IPfrParticipatoryApplicantEvidenceReminderService
{
    Task<bool> Handle();
}