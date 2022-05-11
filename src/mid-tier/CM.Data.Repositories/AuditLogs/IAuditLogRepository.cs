using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.AuditLogs;

public interface IAuditLogRepository : IRepository<AuditLog>
{
    Task<List<AuditLog>> GetAllAsync(Guid disputeGuid, int index, int count, byte? showErrors, byte? callType);
}