using System.Threading.Tasks;
using CM.Business.Entities.Models.ExternalErrorLog;

namespace CM.Business.Services.ExternalErrorLog
{
    public interface IExternalErrorLogService : IServiceBase
    {
        Task<ExternalErrorLogResponse> CreateAsync(ExternalErrorLogRequest request);

        Task<bool> DeleteAsync(int externalErrorLogId);

        Task<ExternalErrorLogResponse> GetExternalErrorLog(int externalErrorLogId);

        Task<ExternalErrorLogGetResponse> GetExternalErrorLogs(ExternalErrorLogGetRequest request, int index, int count);

        Task<ExternalErrorLogPatchRequest> GetForPatchAsync(int externalErrorLogId);

        Task<ExternalErrorLogResponse> PatchAsync(int externalErrorLogId, ExternalErrorLogPatchRequest externalErrorLogToPatch);
    }
}
