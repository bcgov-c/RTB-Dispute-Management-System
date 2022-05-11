using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.BulkEmailRecipient;

public class BulkEmailRecipientRepository : CmRepository<Model.BulkEmailRecipient>, IBulkEmailRecipientRepository
{
    public BulkEmailRecipientRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<List<Model.BulkEmailRecipient>> GetBulkEmailRecipients(int bulkEmailBatchId)
    {
        var result = await Context.BulkEmailRecipients.Where(x => x.BulkEmailBatchId == bulkEmailBatchId).ToListAsync();
        return result;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(int id)
    {
        var dates = await Context.BulkEmailRecipients
            .Where(p => p.BulkEmailRecipientId == id)
            .Select(d => d.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }

    public async Task<bool> IsAnyBulkEmailBatchId(int bulkEmailBatchId)
    {
        var isAny = await Context.BulkEmailRecipients.AnyAsync(x => x.BulkEmailBatchId == bulkEmailBatchId);
        return isAny;
    }
}