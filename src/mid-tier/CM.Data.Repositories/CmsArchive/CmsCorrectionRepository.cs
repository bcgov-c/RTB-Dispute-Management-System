using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.CmsArchive;

public class CmsCorrectionRepository : CmRepository<CMSCorrection>, ICmsCorrectionRepository
{
    public CmsCorrectionRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<List<CMSCorrection>> GetByRequestId(string requestId)
    {
        var corrections = await Context.CMSCorrections.Where(x => x.Request_ID == requestId).ToListAsync();
        return corrections;
    }
}