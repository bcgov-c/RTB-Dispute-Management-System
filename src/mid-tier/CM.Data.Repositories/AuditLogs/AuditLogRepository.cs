using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.AuditLogs;

public class AuditLogRepository : CmRepository<AuditLog>, IAuditLogRepository
{
    public AuditLogRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<List<AuditLog>> GetAllAsync(Guid disputeGuid, int index, int count, byte? showErrors, byte? callType)
    {
        var predicate = PredicateBuilder.True<AuditLog>();

        predicate = predicate.And(a => a.DisputeGuid == disputeGuid);

        if (showErrors.HasValue)
        {
            if (showErrors.Value == 0)
            {
                predicate = predicate.And(x => x.ApiResponse == "200");
            }
        }
        else
        {
            predicate = predicate.And(x => x.ApiResponse == "200");
        }

        if (callType.HasValue)
        {
            predicate = callType.Value switch
            {
                (byte)ApiCallType.Post => predicate.And(x => x.ApiCallType == "POST"),
                (byte)ApiCallType.Patch => predicate.And(x => x.ApiCallType == "PATCH"),
                (byte)ApiCallType.Delete => predicate.And(x => x.ApiCallType == "DELETE"),
                (byte)ApiCallType.Get => predicate,
                _ => throw new ArgumentException("Invalid ApiCallType")
            };
        }

        return await Context.AuditLogs
            .Where(predicate)
            .OrderByDescending(a => a.ChangeDate)
            .AsQueryable()
            .ApplyPagingArrayStyle(count, index)
            .ToListAsync();
    }

    public async Task<AuditLog> GetNoTrackAuditLogByIdAsync(int auditLogId)
    {
        var auditLog = await Context.AuditLogs
            .AsTracking()
            .SingleOrDefaultAsync(d => d.AuditLogId == auditLogId);

        return auditLog;
    }
}