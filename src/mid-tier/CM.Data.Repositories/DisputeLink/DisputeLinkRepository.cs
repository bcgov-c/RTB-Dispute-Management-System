using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Business.Entities.Models.OnlineMeeting;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.DisputeLink
{
    public class DisputeLinkRepository : CmRepository<Model.DisputeLink>, IDisputeLinkRepository
    {
        public DisputeLinkRepository(CaseManagementContext context)
        : base(context)
        {
        }

        public async Task<List<Model.DisputeLink>> GetByDisputeAsync(Guid disputeGuid, DisputeLinkGetRequest request)
        {
            var disputeLinks = await Context
                .DisputeLinks
                .Where(x => x.DisputeGuid == disputeGuid
                && ((request != null && request.DisputeLinkStatus.HasValue) ? x.DisputeLinkStatus == request.DisputeLinkStatus : true))
                .ToListAsync();

            return disputeLinks;
        }

        public async Task<bool> IsExists(Common.Utilities.DisputeLinkRole disputeLinkRole, int onlineMeetingId)
        {
            var exists = await Context
                .DisputeLinks
                .AnyAsync(x => x.DisputeLinkRole == disputeLinkRole &&
                                x.OnlineMeetingId == onlineMeetingId &&
                                x.DisputeLinkStatus == Common.Utilities.DisputeLinkStatus.Active);
            return exists;
        }
    }
}
