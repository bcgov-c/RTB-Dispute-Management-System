using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.ExternalFile;

public class ExternalFileRepository : CmRepository<Model.ExternalFile>, IExternalFileRepository
{
    public ExternalFileRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(int externalFileId)
    {
        var dates = await Context.ExternalFiles
            .Where(p => p.ExternalFileId == externalFileId)
            .Select(d => d.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }

    public async Task<List<Model.ExternalFile>> GetExternalFilesByType(int externalCustomDataObjectId)
    {
        var externalFiles = await Context.ExternalFiles
            .Where(c => c.ExternalCustomDataObjectId == externalCustomDataObjectId)
            .ToListAsync();

        return externalFiles;
    }
}