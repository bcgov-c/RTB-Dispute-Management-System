using System.Linq;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.SiteVersion;

public class SiteVersionRepository : CmRepository<Model.SiteVersion>, ISiteVersionRepository
{
    public SiteVersionRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<byte> GetTokenMethod()
    {
        var tokenMethod = await Context.SiteVersion
            .OrderByDescending(x => x.SiteVersionId)
            .FirstOrDefaultAsync();

        return tokenMethod.TokenMethod;
    }
}