using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.ServiceAuditLog;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.ServiceAuditLog
{
    public class ServiceAuditLogService : CmServiceBase, IServiceAuditLogService
    {
        public ServiceAuditLogService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
        {
        }

        public async Task<int> CreateServiceAuditLog(ServiceAuditLogRequest request)
        {
            var newServiceAuditLog = MapperService.Map<ServiceAuditLogRequest, Data.Model.ServiceAuditLog>(request);

            await UnitOfWork.ServiceAuditLogRepository.InsertAsync(newServiceAuditLog);
            var result = await UnitOfWork.Complete();
            return result.CheckSuccess() ? result : Constants.NotFoundOrIncorrect;
        }

        public async Task<ServiceAuditLogGetResponse> GetServiceAuditLogsAsync(Guid disputeGuid, ServiceAuditLogGetRequest request, int index, int count)
        {
            if (count == 0)
            {
                count = Pagination.DefaultPageSize;
            }

            var result = new ServiceAuditLogGetResponse();

            var predicate = PredicateBuilder.True<Data.Model.ServiceAuditLog>();

            predicate = predicate.And(x => x.DisputeGuid == disputeGuid);

            if (request.ServiceChangeType != null && request.ServiceChangeType.Any())
            {
                predicate = predicate.And(x => request.ServiceChangeType.Contains(x.ServiceChangeType.Value));
            }

            if (request.ServiceType != null)
            {
                predicate = predicate.And(x => x.ServiceType == request.ServiceType.Value);
            }

            if (request.NoticeServiceId != null)
            {
                predicate = predicate.And(x => x.NoticeServiceId == request.NoticeServiceId.Value);
            }

            if (request.FilePackageServiceId != null)
            {
                predicate = predicate.And(x => x.FilePackageServiceId == request.FilePackageServiceId.Value);
            }

            if (request.ParticipantId != null)
            {
                predicate = predicate.And(x => x.ParticipantId == request.ParticipantId);
            }

            var serviceAuditLogs = await UnitOfWork.ServiceAuditLogRepository
                .GetByPredicate(predicate, count, index);
            var totalCount = await UnitOfWork.ServiceAuditLogRepository
                .GetByPredicateTotalCount(predicate);

            var list = MapperService.Map<ICollection<Data.Model.ServiceAuditLog>, ICollection<ServiceAuditLogResponse>>(serviceAuditLogs).ToList();
            result.ServiceAuditLogs = list;
            result.TotalCount = totalCount;

            return result;
        }
    }
}
