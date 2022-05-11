using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.Files;

public interface IFileRepository : IRepository<File>
{
    Task<List<File>> GetDisputeFiles(Guid disputeGuid);

    Task<DateTime?> GetLastModifiedDateAsync(int fileId);

    Task<bool> CheckAddedByExistence(int fileId, int addedBy);

    Task<File> GetFile(int? fileId);

    Task<List<File>> GetFilesByCreatedDate(DateTime startDate, DateTime endDate);

    Task<List<File>> GetEvidenceFilesByCreatedDate(DateTime startDate, DateTime endDate, List<File> files);

    Task<List<File>> GetActiveFiles();
}