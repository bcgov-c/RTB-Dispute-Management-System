using System;
using System.Threading.Tasks;
using CM.Business.Entities.Models.Files;
using CM.Business.Services.Base;

namespace CM.Business.Services.Files;

public interface ILinkedFileService : IServiceBase, IDisputeResolver
{
    Task<LinkedFileResponse> CreateAsync(Guid disputeGuid, LinkedFileRequest linkFile);

    Task<bool> DeleteAsync(int linkFileId);

    Task<LinkedFileListResponse> GetByDisputeAsync(Guid disputeGuid, int count, int index);
}