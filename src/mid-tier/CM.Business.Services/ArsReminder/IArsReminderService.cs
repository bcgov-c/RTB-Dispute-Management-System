using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CM.Business.Services.ArsReminder
{
    public interface IArsReminderService
    {
        Task<bool> ArsDeclarationDeadlineReminderNotifications();

        Task<bool> ArsDeclarationDeadlineMissedNotifications();

        Task<bool> ArsReinstatementDeadlineReminderNotifications();

        Task<bool> ArsReinstatementDeadlineMissedNotifications();
    }
}
