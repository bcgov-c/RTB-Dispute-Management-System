using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.ExternalErrorLog;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.ExternalErrorLog
{
    public class ExternalErrorLogService : CmServiceBase, IExternalErrorLogService
    {
        public ExternalErrorLogService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
        {
        }

        public async Task<ExternalErrorLogResponse> CreateAsync(ExternalErrorLogRequest request)
        {
            var newExternalErrorLog = MapperService.Map<ExternalErrorLogRequest, Data.Model.ExternalErrorLog>(request);
            await UnitOfWork.ExternalErrorLogRepository.InsertAsync(newExternalErrorLog);

            var result = await UnitOfWork.Complete();

            if (result.CheckSuccess())
            {
                return MapperService.Map<Data.Model.ExternalErrorLog, ExternalErrorLogResponse>(newExternalErrorLog);
            }

            return null;
        }

        public async Task<bool> DeleteAsync(int externalErrorLogId)
        {
            var externalErrorLog = await UnitOfWork.ExternalErrorLogRepository.GetByIdAsync(externalErrorLogId);
            if (externalErrorLog != null)
            {
                externalErrorLog.IsDeleted = true;
                UnitOfWork.ExternalErrorLogRepository.Attach(externalErrorLog);

                var result = await UnitOfWork.Complete();
                return result.CheckSuccess();
            }

            return false;
        }

        public async Task<ExternalErrorLogResponse> GetExternalErrorLog(int externalErrorLogId)
        {
            var externalErrorLog = await UnitOfWork.ExternalErrorLogRepository.GetByIdAsync(externalErrorLogId);
            return MapperService.Map<Data.Model.ExternalErrorLog, ExternalErrorLogResponse>(externalErrorLog);
        }

        public async Task<ExternalErrorLogGetResponse> GetExternalErrorLogs(ExternalErrorLogGetRequest request, int index, int count)
        {
            if (count == 0)
            {
                count = Pagination.DefaultPageSize;
            }

            var response = new ExternalErrorLogGetResponse();

            var(externalErrorLogs, externalErrorLogsCount) = await UnitOfWork.ExternalErrorLogRepository.GetExternalErrorLogs(request, index, count);

            response.ExternalErrorLogs = MapperService.Map<List<Data.Model.ExternalErrorLog>, List<ExternalErrorLogResponse>>(externalErrorLogs);
            response.TotalAvailableRecords = externalErrorLogsCount;

            return response;
        }

        public async Task<ExternalErrorLogPatchRequest> GetForPatchAsync(int externalErrorLogId)
        {
            var externalErrorLog = await UnitOfWork.ExternalErrorLogRepository.GetNoTrackingByIdAsync(
            x => x.ExternalErrorLogId == externalErrorLogId);
            return MapperService.Map<Data.Model.ExternalErrorLog, ExternalErrorLogPatchRequest>(externalErrorLog);
        }

        public async Task<DateTime?> GetLastModifiedDateAsync(object id)
        {
            var lastModifiedDate = await UnitOfWork.ExternalErrorLogRepository.GetLastModifiedDate((int)id);
            return lastModifiedDate;
        }

        public async Task<ExternalErrorLogResponse> PatchAsync(int externalErrorLogId, ExternalErrorLogPatchRequest externalErrorLogToPatch)
        {
            var externalErrorLog = await UnitOfWork.ExternalErrorLogRepository.GetByIdAsync(externalErrorLogId);
            MapperService.Map(externalErrorLogToPatch, externalErrorLog);

            UnitOfWork.ExternalErrorLogRepository.Attach(externalErrorLog);
            var result = await UnitOfWork.Complete();
            if (result.CheckSuccess())
            {
                return MapperService.Map<Data.Model.ExternalErrorLog, ExternalErrorLogResponse>(externalErrorLog);
            }

            return null;
        }
    }
}
