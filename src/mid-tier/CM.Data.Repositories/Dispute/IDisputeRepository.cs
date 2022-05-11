using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.Dispute;

public interface IDisputeRepository : IRepository<Model.Dispute>
{
    Task<Model.Dispute> GetDispute(Guid disputeGuid);

    Task<Model.Dispute> GetDisputeByGuidAsync(Guid disputeGuid);

    Task<Model.Dispute> GetDisputeWithStatusByGuidAsync(Guid disputeGuid);

    Task<int> GetDisputesCountAsync(int userId, int? creationMethod);

    Task<DateTime?> GetLastModifiedDate(Guid disputeGuid);

    Task<Model.Dispute> GetNoTrackDisputeByGuidAsync(Guid disputeGuid);

    Task<List<Model.Dispute>> GetUsersDisputesAsync(int userId, int count, int index, int? creationMethod);

    Task<Model.Dispute> GetDisputeByFileNumber(int fileNumber);

    Task<int?> GetFileNumber(Guid disputeGuid);

    Task<Model.Dispute> GetDisputeByFileNumberWithStatus(int fileNumber);

    Task<List<Model.Dispute>> GetDisputesWithLastModify(List<Guid> disputesGuid, DateTime? lastLoadedDateTime, int dateDelay);

    Task<List<Model.Dispute>> GetDisputeByInitialPaymentDate(DateTime startDate, DateTime endDate);

    Task<int> GetOpenDisputesCount();

    Task<List<Model.Dispute>> GetDisputesByDisputeGuid(List<Guid> disputeGuids);
}