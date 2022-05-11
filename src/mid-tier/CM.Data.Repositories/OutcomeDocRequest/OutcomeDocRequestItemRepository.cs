using System;
using System.Linq;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.OutcomeDocRequest;

public class OutcomeDocRequestItemRepository : CmRepository<OutcomeDocReqItem>, IOutcomeDocRequestItemRepository
{
    public OutcomeDocRequestItemRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<DateTime?> GetLastModifiedDate(int id)
    {
        var dates = await Context.OutcomeDocReqItems
            .Where(n => n.OutcomeDocReqItemId == id)
            .Select(n => n.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }

    public async Task<bool> IsAnyReqItemsExist(int outcomeDocRequestId)
    {
        var isAnyReqItems = await Context.OutcomeDocReqItems.AnyAsync(x => x.OutcomeDocRequestId == outcomeDocRequestId);
        return isAnyReqItems;
    }
}