using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.SubmissionReceipt;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.SubmissionReceipt;

public interface ISubmissionReceiptRepository : IRepository<Model.SubmissionReceipt>
{
    Task<DateTime?> GetLastModifiedDate(int id);

    Task<List<Model.SubmissionReceipt>> GetByDisputeGuid(Guid disputeGuid);

    Task<(List<Model.SubmissionReceipt> receipts, int totalCount)> GetExternalSubmissionReceipts(Guid disputeGuid, ExternalSubmissionReceiptRequest request);
}