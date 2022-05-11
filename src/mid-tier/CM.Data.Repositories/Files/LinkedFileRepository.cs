using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.Files;

public class LinkedFileRepository : CmRepository<LinkedFile>, ILinkedFileRepository
{
    public LinkedFileRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<List<LinkedFile>> GetDisputeLinkedFilesAsync(Guid disputeGuid)
    {
        var linkedFiles = await Context.LinkedFiles
            .Where(c => c.DisputeGuid == disputeGuid)
            .ToListAsync();
        return linkedFiles;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(int id)
    {
        var dates = await Context.LinkedFiles
            .Where(p => p.LinkedFileId == id)
            .Select(d => d.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }

    public async Task<List<LinkedFile>> GetLinkedFilesByFileDescription(int fileDescriptionId)
    {
        var linkedFiles = await Context.LinkedFiles
            .Include(f => f.File)
            .ThenInclude(f => f.FilePackage)
            .Where(x => x.FileDescriptionId.Equals(fileDescriptionId))
            .ToListAsync();

        return linkedFiles;
    }
}