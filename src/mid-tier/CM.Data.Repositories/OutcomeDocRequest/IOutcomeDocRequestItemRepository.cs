using System;
using System.Threading.Tasks;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.OutcomeDocRequest;

public interface IOutcomeDocRequestItemRepository : IRepository<Model.OutcomeDocReqItem>
{
    Task<bool> IsAnyReqItemsExist(int outcomeDocRequestId);

    Task<DateTime?> GetLastModifiedDate(int id);
}