using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.AuditLog;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.AuditLogs;

public class AuditLogService : CmServiceBase, IAuditLogService
{
    public AuditLogService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<AuditLog> InsertAsync(AuditLogRequest request)
    {
        var newAuditLog = MapperService.Map<AuditLogRequest, AuditLog>(request);
        var auditLogResult = await UnitOfWork.AuditLogRepository.InsertAsync(newAuditLog);
        var result = await UnitOfWork.Complete();
        return result.CheckSuccess() ? auditLogResult : null;
    }

    public async Task<List<AuditLogListResponse>> GetAllAsync(Guid disputeGuid, int index, int count, byte? showErrors, byte? callType)
    {
        if (count == 0)
        {
            count = Pagination.DefaultPageSize;
        }

        var auditLogs = await UnitOfWork.AuditLogRepository.GetAllAsync(disputeGuid, index, count, showErrors, callType);

        if (auditLogs != null)
        {
            return MapperService.Map<List<AuditLog>, List<AuditLogListResponse>>(auditLogs);
        }

        return null;
    }

    public async Task<AuditLogItemResponse> GetAsync(int id)
    {
        var auditLog = await UnitOfWork.AuditLogRepository.GetByIdAsync(id);
        if (auditLog != null)
        {
            return MapperService.Map<AuditLog, AuditLogItemResponse>(auditLog);
        }

        return null;
    }
}