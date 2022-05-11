using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.OutcomeDocument;

public class OutcomeDocFileRepository : CmRepository<OutcomeDocFile>, IOutcomeDocFileRepository
{
    public OutcomeDocFileRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<List<OutcomeDocFile>> GetDisputeOutcomeDocFiles(Guid disputeGuid)
    {
        var outcomeDocFiles = await Context.OutcomeDocFiles
            .Include(x => x.File)
            .Where(o => o.DisputeGuid == disputeGuid)
            .ToListAsync();

        return outcomeDocFiles;
    }

    public async Task<DateTime?> GetLastModifiedDate(int outcomeDocFileId)
    {
        var dates = await Context.OutcomeDocFiles
            .Where(n => n.OutcomeDocFileId == outcomeDocFileId)
            .Select(n => n.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }

    public async Task<List<OutcomeDocFile>> GetOutcomeDocFiles(Guid disputeGuid, int[] notEqualToFileTypes)
    {
        var outcomeDocFiles = await Context.OutcomeDocFiles.Include(x => x.File)
            .Where(x => x.DisputeGuid == disputeGuid && !notEqualToFileTypes.Contains(x.FileType)).ToListAsync();
        return outcomeDocFiles;
    }

    public async Task<OutcomeDocFile> GetOutcomeDocFileWithFile(int outcomeDocFileId)
    {
        var outcomeDocFile = await Context.OutcomeDocFiles
            .Include(x => x.File)
            .SingleOrDefaultAsync(x => x.OutcomeDocFileId == outcomeDocFileId);

        return outcomeDocFile;
    }

    public async Task<bool> IsDeliveredOutcomeDocument(Guid disputeGuid)
    {
        var files = await Context.OutcomeDocDeliveries
            .Where(x => x.DisputeGuid == disputeGuid && x.IsDelivered == true)
            .Select(x => x.OutcomeDocFileId)
            .ToListAsync();

        var isExist = await Context
            .OutcomeDocFiles
            .AnyAsync(x => x.DisputeGuid == disputeGuid
                           && x.OutcomeDocGroup.DocStatus == (byte)OutcomeDocStatus.Active
                           && x.FileId != null
                           && files.Contains(x.OutcomeDocFileId));

        return isExist;
    }
}