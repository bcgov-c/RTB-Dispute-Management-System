using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.OutcomeDocument;

public interface IOutcomeDocFileRepository : IRepository<OutcomeDocFile>
{
    Task<List<OutcomeDocFile>> GetDisputeOutcomeDocFiles(Guid disputeGuid);

    Task<DateTime?> GetLastModifiedDate(int outcomeDocFileId);

    Task<List<OutcomeDocFile>> GetOutcomeDocFiles(Guid disputeGuid, int[] notEqualToFileTypes);

    Task<OutcomeDocFile> GetOutcomeDocFileWithFile(int outcomeDocFileId);

    Task<bool> IsDeliveredOutcomeDocument(Guid disputeGuid);
}