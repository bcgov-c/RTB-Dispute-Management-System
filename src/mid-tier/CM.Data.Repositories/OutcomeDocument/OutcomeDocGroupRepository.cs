using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.OutcomeDocument;

public class OutcomeDocGroupRepository : CmRepository<OutcomeDocGroup>, IOutcomeDocGroupRepository
{
    public OutcomeDocGroupRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<OutcomeDocGroup> GetByIdWithIncludeAsync(int outcomeDocGroupId)
    {
        var outcomeDocGroup = await GetByIdAsync(outcomeDocGroupId);
        if (outcomeDocGroup != null)
        {
            var outcomeDocFiles = await Context.OutcomeDocFiles
                .Include(f => f.OutcomeDocContents)
                .Include(f => f.OutcomeDocDeliveries)
                .Where(o => o.OutcomeDocGroupId == outcomeDocGroup.OutcomeDocGroupId)
                .ToListAsync();

            outcomeDocGroup.OutcomeDocFiles = outcomeDocFiles;
            return outcomeDocGroup;
        }

        return null;
    }

    public async Task<List<OutcomeDocGroup>> GetByDisputeGuidWithIncludeAsync(Guid disputeGuid)
    {
        var outcomeDocGroups = await Context.OutcomeDocGroups
            .Where(o => o.DisputeGuid == disputeGuid)
            .ToListAsync();

        if (outcomeDocGroups != null && outcomeDocGroups.Count != 0)
        {
            foreach (var outcomeDocGroup in outcomeDocGroups)
            {
                var outcomeDocFiles = await Context.OutcomeDocFiles
                    .Include(f => f.OutcomeDocContents)
                    .Include(f => f.OutcomeDocDeliveries)
                    .Where(o => o.OutcomeDocGroupId == outcomeDocGroup.OutcomeDocGroupId)
                    .ToListAsync();

                outcomeDocGroup.OutcomeDocFiles = outcomeDocFiles;
            }

            return outcomeDocGroups;
        }

        return null;
    }

    public async Task<DateTime?> GetLastModifiedDate(int outcomeDocGroupId)
    {
        var dates = await Context.OutcomeDocGroups
            .Where(n => n.OutcomeDocGroupId == outcomeDocGroupId)
            .Select(n => n.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }

    public async Task<List<OutcomeDocGroup>> GetByDisputeGuidWithDocuments(Guid disputeGuid, bool includeNonDeliveredOutcomeDocs)
    {
        var outcomeDocGroups = await Context.OutcomeDocGroups
            .Include(x => x.OutcomeDocFiles
                .Where(o => o.OutcomeDocDeliveries
                    .Any(d => d.IsDelivered == true || includeNonDeliveredOutcomeDocs)))
            .Where(o => o.DisputeGuid == disputeGuid)
            .ToListAsync();

        if (includeNonDeliveredOutcomeDocs || outcomeDocGroups.Any(x => x.OutcomeDocFiles.Count > 0))
        {
            return outcomeDocGroups;
        }

        return null;
    }

    public async Task<OutcomeDocGroup> GetDocGroup(Guid disputeGuid, int outcomeDocGroupId)
    {
        var outcomeDocGroup = await Context.OutcomeDocGroups
            .FirstOrDefaultAsync(o => o.DisputeGuid == disputeGuid && o.OutcomeDocGroupId == outcomeDocGroupId);

        return outcomeDocGroup;
    }
}