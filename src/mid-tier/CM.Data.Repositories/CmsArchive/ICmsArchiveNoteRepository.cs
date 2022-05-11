using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.CmsArchive;

public interface ICmsArchiveNoteRepository : IRepository<CMSArchiveNote>
{
    Task<List<CMSArchiveNote>> GetByFileNumber(string fileNumber);
}