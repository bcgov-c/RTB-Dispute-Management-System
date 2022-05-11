using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.Files;

public interface IFileDescriptionRepository : IRepository<FileDescription>
{
    Task<List<FileDescription>> GetDisputeFileDescriptionsAsync(Guid disputeGuid);

    Task<List<FileDescription>> GetFileDescriptionsForEmailAsync(Guid disputeGuid);

    Task<int> GetFileDescriptionsCountAsync(Guid disputeGuid);

    Task<DateTime?> GetLastModifiedDateAsync(int fileDescriptionId);

    Task<List<FileDescription>> GetDisputeUnlinkedFileDescriptionsAsync(Guid disputeGuid);

    Task<FileDescription> GetFileDescription(Guid disputeGuid, int? fileDescriptionId);
}