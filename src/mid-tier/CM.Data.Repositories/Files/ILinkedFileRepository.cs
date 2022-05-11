using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.Files;

public interface ILinkedFileRepository : IRepository<LinkedFile>
{
    Task<List<LinkedFile>> GetDisputeLinkedFilesAsync(Guid disputeGuid);

    Task<List<LinkedFile>> GetLinkedFilesByFileDescription(int fileDescriptionId);

    Task<DateTime?> GetLastModifiedDateAsync(int id);
}