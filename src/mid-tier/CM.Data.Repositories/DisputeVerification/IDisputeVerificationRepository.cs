using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.DisputeVerification;
using CM.Data.Model;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.DisputeVerification
{
    public interface IDisputeVerificationRepository : IRepository<Model.DisputeVerification>
    {
        Task<Data.Model.DisputeVerification> GetDisputeVerification(int verificationId);

        Task<List<Data.Model.DisputeVerification>> GetDisputeVerifications(Guid disputeGuid);

        Task<DateTime?> GetLastModifiedDate(int id);
    }
}
