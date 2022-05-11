using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.CmsArchive;

public interface ICmsCorrectionRepository : IRepository<CMSCorrection>
{
    Task<List<CMSCorrection>> GetByRequestId(string requestId);
}