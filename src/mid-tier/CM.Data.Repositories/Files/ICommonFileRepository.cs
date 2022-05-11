using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.Files;

public interface ICommonFileRepository : IRepository<CommonFile>
{
    Task<DateTime?> GetLastModifiedDateAsync(int commonFileId);

    Task<CommonFile> GetCommonFileWithType(int commonFileId, CommonFileType? fileType);

    Task<List<CommonFile>> GetCommonFilesByType(CommonFileType? fileType, int count, int index);
}