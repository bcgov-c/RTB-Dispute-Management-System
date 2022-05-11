using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.Hearings;

public class ImportHearingRepository : CmRepository<HearingImport>, IImportHearingRepository
{
    public ImportHearingRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<bool> GetByFileIdAsync(int importFileId)
    {
        var exist = await Context.HearingImports.AnyAsync(x => x.ImportFileId == importFileId);
        return exist;
    }

    public async Task<List<HearingImport>> GetHearingImports(int index, int count)
    {
        var hearingImports = await Context.HearingImports.ApplyPagingArrayStyle(count, index).ToListAsync();
        return hearingImports;
    }
}