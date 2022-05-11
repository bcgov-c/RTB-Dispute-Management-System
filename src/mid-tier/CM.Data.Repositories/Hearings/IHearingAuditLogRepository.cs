using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.HearingAuditLog;
using CM.Data.Model;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.Hearings;

public interface IHearingAuditLogRepository : IRepository<HearingAuditLog>
{
    Task<List<HearingAuditLog>> GetHearingAuditLogs(HearingAuditLogGetRequest request);
}