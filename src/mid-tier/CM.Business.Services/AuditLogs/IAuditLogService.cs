using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.AuditLog;
using CM.Data.Model;

namespace CM.Business.Services.AuditLogs;

public interface IAuditLogService
{
    Task<AuditLog> InsertAsync(AuditLogRequest request);

    Task<List<AuditLogListResponse>> GetAllAsync(Guid disputeGuid, int index, int count, byte? showErrors, byte? callType);

    Task<AuditLogItemResponse> GetAsync(int id);
}