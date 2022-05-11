using System.Threading.Tasks;
using CM.Business.Entities.Models.HearingAuditLog;
using CM.Common.Utilities;
using CM.Data.Model;

namespace CM.Business.Services.Hearings;

public interface IHearingAuditLogService
{
    Task<bool> CreateAsync(HearingAuditLogCase logCase, Hearing hearingResult, Data.Model.DisputeHearing disputeHearingResult, bool withComplete = true);

    Task<HearingAuditLogGetResponse> GetHearingAuditLogs(HearingAuditLogGetRequest request, int count, int index);
}