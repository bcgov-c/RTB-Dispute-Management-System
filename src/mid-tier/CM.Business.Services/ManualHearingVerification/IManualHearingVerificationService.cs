using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CM.Business.Services.ManualHearingVerification
{
    public interface IManualHearingVerificationService
    {
        Task<bool> RunMhvAppCnFirstReminder();

        Task<bool> RunMhvAppNotLinkedFirstReminder();

        Task<bool> RunMhvAppLinkedFirstReminder();

        Task<bool> RunMhvAppCnFinalReminder();

        Task<bool> RunMhvAppNotLinkedFinalReminder();

        Task<bool> RunMhvAppLinkedFinalReminder();
    }
}
