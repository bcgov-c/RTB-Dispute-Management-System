using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.OnlineMeeting;
using CM.Common.Utilities;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.DisputeLink
{
    public interface IDisputeLinkRepository : IRepository<Model.DisputeLink>
    {
        Task<List<Model.DisputeLink>> GetByDisputeAsync(Guid disputeGuid, DisputeLinkGetRequest request);

        Task<bool> IsExists(DisputeLinkRole disputeLinkRole, int onlineMeetingId);
    }
}
