using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.CmsArchive;

public class CmsFileRepository : CmRepository<CMSFile>, ICmsFileRepository
{
    public CmsFileRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<List<CMSFile>> GetAllFiles(string fileNumber)
    {
        var files = await Context.CMSFiles.Where(x => x.File_Number == fileNumber).ToListAsync();

        return files;
    }

    public async Task<List<CMSFile>> GetEvidenceFiles(string fileNumber)
    {
        var evidenceFiles = await Context.CMSFiles.Where(x => x.File_Number == fileNumber && x.File_Type == (byte)FileType.ExternalEvidence).ToListAsync();

        return evidenceFiles;
    }

    public async Task<List<CMSFile>> GetOutcomeFiles(string fileNumber)
    {
        var outcomeFiles = await Context.CMSFiles.Where(x => x.File_Number == fileNumber && x.File_Type == (byte)FileType.Notice).ToListAsync();

        return outcomeFiles;
    }
}