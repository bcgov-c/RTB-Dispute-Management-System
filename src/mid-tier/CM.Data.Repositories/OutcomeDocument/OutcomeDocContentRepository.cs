using System;
using System.Linq;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.OutcomeDocument;

public class OutcomeDocContentRepository : CmRepository<OutcomeDocContent>, IOutcomeDocContentRepository
{
    public OutcomeDocContentRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<DateTime?> GetLastModifiedDate(int outcomeDocContentId)
    {
        var dates = await Context.OutcomeDocContents
            .Where(n => n.OutcomeDocContentId == outcomeDocContentId)
            .Select(n => n.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }
}