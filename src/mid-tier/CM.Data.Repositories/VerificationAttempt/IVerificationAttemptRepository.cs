using System.Threading.Tasks;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.VerificationAttempt
{
    public interface IVerificationAttemptRepository : IRepository<Model.VerificationAttempt>
    {
        Task<bool> IsAssignedAttemptsExists(int verificationId);
    }
}
