using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.CmsArchive;

public class CmsArchiveNoteRepository : CmRepository<CMSArchiveNote>, ICmsArchiveNoteRepository
{
    public CmsArchiveNoteRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<List<CMSArchiveNote>> GetByFileNumber(string fileNumber)
    {
        var notes = await Context.CMSArchiveNotes.Where(x => x.File_Number == fileNumber).ToListAsync();
        return notes;
    }
}