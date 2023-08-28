using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.VerificationAttempt
{
    public class VerificationAttemptRepository : CmRepository<Model.VerificationAttempt>, IVerificationAttemptRepository
    {
        public VerificationAttemptRepository(CaseManagementContext context)
        : base(context)
        {
        }

        public async Task<bool> IsAssignedAttemptsExists(int verificationId)
        {
            var isAssigned = await Context.VerificationAttempts.AnyAsync(x => x.DisputeVerificationId == verificationId);
            return isAssigned;
        }
    }
}
