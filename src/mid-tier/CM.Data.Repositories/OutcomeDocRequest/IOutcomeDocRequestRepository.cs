using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.OutcomeDocRequest;

public interface IOutcomeDocRequestRepository : IRepository<Model.OutcomeDocRequest>
{
    Task<DateTime?> GetLastModifiedDate(int id);

    Task<bool> IsOutcomeDocRequestExist(int outcomeDocRequestId);

    Task<Model.OutcomeDocRequest> GetByIdWithChild(int outcomeDocRequestId);

    Task<List<Model.OutcomeDocRequest>> GetByDisputeWithChild(Guid disputeGuid);

    Task<List<Model.OutcomeDocRequest>> GetRequestsByCreatedDate(DateTime startDate, DateTime endDate);

    Task<List<Model.OutcomeDocRequest>> GetOutcomeDocRequests(Guid disputeGuid);
}