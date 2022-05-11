using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.CmsArchive;

public interface ICmsFileRepository : IRepository<CMSFile>
{
    Task<List<CMSFile>> GetAllFiles(string fileNumber);

    Task<List<CMSFile>> GetEvidenceFiles(string fileNumber);

    Task<List<CMSFile>> GetOutcomeFiles(string fileNumber);
}