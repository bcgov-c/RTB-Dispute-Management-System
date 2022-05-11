using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.ExternalFile;

public interface IExternalFileRepository : IRepository<Model.ExternalFile>
{
    Task<DateTime?> GetLastModifiedDateAsync(int externalFileId);

    Task<List<Model.ExternalFile>> GetExternalFilesByType(int externalCustomDataObjectId);
}