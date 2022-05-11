using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.SubmissionReceipt;

public interface ISubmissionReceiptRepository : IRepository<Model.SubmissionReceipt>
{
    Task<DateTime?> GetLastModifiedDate(int id);

    Task<List<Data.Model.SubmissionReceipt>> GetByDisputeGuid(Guid disputeGuid);
}