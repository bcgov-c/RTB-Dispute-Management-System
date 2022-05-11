using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.Hearings;

public interface IImportHearingRepository : IRepository<Model.HearingImport>
{
    Task<List<Model.HearingImport>> GetHearingImports(int index, int count);

    Task<bool> GetByFileIdAsync(int importFileId);
}