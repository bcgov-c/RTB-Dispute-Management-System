using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.TrialDispute;

public interface ITrialDisputeRepository : IRepository<Model.TrialDispute>
{
    Task<DateTime?> GetLastModifiedDate(Guid guid);

    Task<List<Model.TrialDispute>> GetByDisputeGuid(Guid disputeGuid);
}