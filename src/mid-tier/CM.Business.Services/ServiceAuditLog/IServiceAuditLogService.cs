using System;
using System.Threading.Tasks;
using CM.Business.Entities.Models.ServiceAuditLog;

namespace CM.Business.Services.ServiceAuditLog
{
    public interface IServiceAuditLogService
    {
        Task<ServiceAuditLogGetResponse> GetServiceAuditLogsAsync(Guid disputeGuid, ServiceAuditLogGetRequest request, int index, int count);

        Task<int> CreateServiceAuditLog(ServiceAuditLogRequest request);
    }
}
