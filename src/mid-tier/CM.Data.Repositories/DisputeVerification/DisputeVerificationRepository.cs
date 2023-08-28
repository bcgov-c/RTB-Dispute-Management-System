using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Business.Entities.Models.DisputeVerification;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.DisputeVerification
{
    public class DisputeVerificationRepository : CmRepository<Model.DisputeVerification>, IDisputeVerificationRepository
    {
        public DisputeVerificationRepository(CaseManagementContext context)
            : base(context)
        {
        }

        public async Task<Model.DisputeVerification> GetDisputeVerification(int verificationId)
        {
            var disputeVerification = await Context.DisputeVerifications
                .Include(x => x.VerificationAttempts)
                .FirstOrDefaultAsync(x => x.VerificationId == verificationId);
            return disputeVerification;
        }

        public async Task<List<Data.Model.DisputeVerification>> GetDisputeVerifications(Guid disputeGuid)
        {
            var disputeVerifications = await Context.DisputeVerifications
                .Include(x => x.VerificationAttempts)
                .Where(x => x.DisputeGuid == disputeGuid)
                .ToListAsync();
            return disputeVerifications;
        }

        public async Task<DateTime?> GetLastModifiedDate(int id)
        {
            var lastModifiedDate = await Context.DisputeVerifications
            .Where(d => d.VerificationId == id)
            .Select(d => d.ModifiedDate).ToListAsync();

            return lastModifiedDate.FirstOrDefault();
        }
    }
}
