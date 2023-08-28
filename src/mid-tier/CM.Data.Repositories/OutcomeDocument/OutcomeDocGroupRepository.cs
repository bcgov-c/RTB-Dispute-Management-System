using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;
using CM.Business.Entities.Models.OutcomeDocument;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Internal;

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

    public async Task<List<OutcomeDocGroup>> GetExternalOutcomeDocGroups(Guid disputeGuid, ExternalOutcomeDocGroupRequest request)
    {
        var outcomeDocDeliveries = await Context
                                        .OutcomeDocDeliveries
                                        .Where(x => x.DisputeGuid == disputeGuid &&
                                                    x.IsDelivered == true &&
                                                    x.ParticipantId.HasValue &&
                                                    request.DeliveryParticipantIds.Contains(x.ParticipantId.Value))
                                        .ToListAsync();

        var outcomeDocFilesId = outcomeDocDeliveries.Select(x => x.OutcomeDocFileId).ToList();

        var outcomeDocFiles = await Context
            .OutcomeDocFiles
            .Where(x => outcomeDocFilesId.Contains(x.OutcomeDocFileId))
            .ToListAsync();

        var outcomeDocGroupsId = outcomeDocFiles.Select(x => x.OutcomeDocGroupId).ToList();

        var outcomeDocDeliveriesId = outcomeDocDeliveries.Select(x => x.OutcomeDocDeliveryId).ToList();

        var outcomeDocGroups = await Context
            .OutcomeDocGroups
            .Include(x => x.OutcomeDocFiles.Where(f => outcomeDocFilesId.Contains(f.OutcomeDocFileId)))
            .ThenInclude(x => x.OutcomeDocDeliveries.Where(d => outcomeDocDeliveriesId.Contains(d.OutcomeDocDeliveryId)))
            .Where(o => o.DisputeGuid == disputeGuid && outcomeDocGroupsId.Contains(o.OutcomeDocGroupId))
            .ToListAsync();

        return outcomeDocGroups;
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
                    .Any(d => (d.IsDelivered == true && d.DeliveryDate <= DateTime.UtcNow) || includeNonDeliveredOutcomeDocs)))
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

    public async Task<List<OutcomeDocGroup>> GetOutcomeDocGroups(DateTime? lastLoadDateTime, int dateDelay)
    {
        if (!lastLoadDateTime.HasValue)
        {
            lastLoadDateTime = default(DateTime).AddDays(dateDelay);
        }

        var outcomeDocDeliveriesFiles = await Context.OutcomeDocDeliveries
            .Where(x => x.IsDelivered.HasValue && x.IsDelivered.Value == false)
            .Select(x => x.OutcomeDocFileId).ToListAsync();

        var outcomeDocFilesGroups = await Context.OutcomeDocFiles
            .Where(x => outcomeDocDeliveriesFiles.Contains(x.OutcomeDocFileId))
            .Select(x => x.OutcomeDocGroupId)
            .ToListAsync();

        var outcomeDocGroups = await Context.OutcomeDocGroups
                .Include(x => x.OutcomeDocFiles).ThenInclude(d => d.OutcomeDocDeliveries)
                .Where(x => x.DocStatus == (byte?)OutcomeDocStatus.Inactive
                && x.DocStatusDate >= lastLoadDateTime.Value.AddDays(-dateDelay)
                && x.DocStatusDate <= DateTime.UtcNow.AddDays(-dateDelay)
                && !outcomeDocFilesGroups.Contains(x.OutcomeDocGroupId))
                .ToListAsync();

        return outcomeDocGroups;
    }
}