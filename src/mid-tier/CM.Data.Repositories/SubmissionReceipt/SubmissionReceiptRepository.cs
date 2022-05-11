using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.SubmissionReceipt;

public class SubmissionReceiptRepository : CmRepository<Model.SubmissionReceipt>, ISubmissionReceiptRepository
{
    public SubmissionReceiptRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<List<Model.SubmissionReceipt>> GetByDisputeGuid(Guid disputeGuid)
    {
        var submissionReceiptList = await Context.SubmissionReceipts
            .Where(d => d.DisputeGuid == disputeGuid)
            .ToListAsync();

        return submissionReceiptList;
    }

    public async Task<DateTime?> GetLastModifiedDate(int id)
    {
        var lastModifiedDate = await Context.SubmissionReceipts
            .Where(d => d.SubmissionReceiptId == id)
            .Select(d => d.ModifiedDate).ToListAsync();

        return lastModifiedDate.FirstOrDefault();
    }
}