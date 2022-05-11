using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.Files;

public interface IFilePackageRepository : IRepository<FilePackage>
{
    Task<DateTime?> GetLastModifiedDateAsync(int fileId);

    Task<bool> DeleteAsync(int id);

    Task<bool> CheckFilePackageExistenceAsync(int id);

    Task<List<FilePackage>> GetDisputeFilePackagesAsync(Guid disputeGuid, int count, int index);

    Task<List<FilePackage>> GetParticipantFilePackages(int participantId, Guid disputeGuid);
}