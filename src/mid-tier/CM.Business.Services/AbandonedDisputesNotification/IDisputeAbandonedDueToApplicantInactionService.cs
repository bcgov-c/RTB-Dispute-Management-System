using System.Threading.Tasks;

namespace CM.Business.Services.AbandonedDisputesNotification;

public interface IDisputeAbandonedDueToApplicantInactionService
{
    Task<bool> ProcessNotifications();
}