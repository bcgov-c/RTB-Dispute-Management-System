using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Business.Entities.Models.HearingAuditLog;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.Hearings;

public class HearingAuditLogRepository : CmRepository<HearingAuditLog>, IHearingAuditLogRepository
{
    public HearingAuditLogRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<List<HearingAuditLog>> GetHearingAuditLogs(HearingAuditLogGetRequest request)
    {
        var startDate = request.StartDate?.ToUniversalTime() ?? DateTime.Now;
        var endDate = request.EndDate?.ToUniversalTime() ?? DateTime.Now;

        ICollection<HearingAuditLog> result = request.SearchType switch
        {
            1 => await Context.HearingAuditLogs
                .Include(x => x.Dispute)
                .Where(x => x.HearingId == request.HearingId.Value)
                .ToListAsync(),
            2 => await Context.HearingAuditLogs
                .Include(x => x.Dispute)
                .Where(x => x.DisputeGuid == request.DisputeGuid.Value)
                .ToListAsync(),
            3 => await Context.HearingAuditLogs
                .Include(x => x.Dispute)
                .Where(x => x.HearingOwner == request.HearingOwner.Value &&
                            DateTime.Compare(x.CreatedDate.Value, startDate) >= 0 &&
                            DateTime.Compare(x.CreatedDate.Value, endDate) <= 0)
                .ToListAsync(),
            4 => await Context.HearingAuditLogs
                .Include(x => x.Dispute)
                .Where(x => x.CreatedBy == request.CreatedBy.Value &&
                            DateTime.Compare(x.CreatedDate.Value, startDate) >= 0 &&
                            DateTime.Compare(x.CreatedDate.Value, endDate) <= 0)
                .ToListAsync(),
            5 => await Context.HearingAuditLogs
                .Include(x => x.Dispute)
                .Where(x => x.HearingChangeType == HearingChangeType.ChangeOwner &&
                            DateTime.Compare(x.CreatedDate.Value, startDate) >= 0 &&
                            DateTime.Compare(x.CreatedDate.Value, endDate) <= 0)
                .ToListAsync(),
            6 => await Context.HearingAuditLogs
                .Include(x => x.Dispute)
                .Where(x => (x.HearingChangeType == HearingChangeType.CreateHearing ||
                             x.HearingChangeType == HearingChangeType.DeleteHearing) &&
                            DateTime.Compare(x.CreatedDate.Value, startDate) >= 0 &&
                            DateTime.Compare(x.CreatedDate.Value, endDate) <= 0)
                .ToListAsync(),
            7 => await Context.HearingAuditLogs
                .Include(x => x.Dispute)
                .Where(x => x.HearingChangeType == HearingChangeType.ChangeHearingInfo &&
                            DateTime.Compare(x.CreatedDate.Value, startDate) >= 0 &&
                            DateTime.Compare(x.CreatedDate.Value, endDate) <= 0)
                .ToListAsync(),
            8 => await Context.HearingAuditLogs
                .Include(x => x.Dispute)
                .Where(x => (x.HearingChangeType == HearingChangeType.DeleteDisputeLink || x.HearingChangeType == HearingChangeType.AddDisputeLink) &&
                            DateTime.Compare(x.CreatedDate.Value, startDate) >= 0 &&
                            DateTime.Compare(x.CreatedDate.Value, endDate) <= 0)
                .ToListAsync(),
            9 => await Context.HearingAuditLogs
                .Include(x => x.Dispute)
                .Where(x => DateTime.Compare(x.CreatedDate.Value, startDate) >= 0 &&
                            DateTime.Compare(x.CreatedDate.Value, endDate) <= 0)
                .ToListAsync(),
            _ => null
        };

        return await result.ToListAsync();
    }
}