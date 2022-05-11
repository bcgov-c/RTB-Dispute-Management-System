using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.DisputeFlag;

public interface IDisputeFlagRepository : IRepository<Model.DisputeFlag>
{
    Task<DateTime?> GetLastModifiedDate(int id);

    Task<List<Data.Model.DisputeFlag>> GetByDisputeGuid(Guid disputeGuid);

    Task<Data.Model.DisputeFlag> GetFlagWithDispute(int disputeFlagId);

    Task<List<Data.Model.DisputeFlag>> GetFlagsByGuidList(List<Guid?> guidList);
}