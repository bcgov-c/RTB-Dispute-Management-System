using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Business.Entities.Models.ExternalErrorLog;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.ExternalErrorLog
{
    public class ExternalErrorLogRepository : CmRepository<Model.ExternalErrorLog>, IExternalErrorLogRepository
    {
        public ExternalErrorLogRepository(CaseManagementContext context)
        : base(context)
        {
        }

        public async Task<(List<Model.ExternalErrorLog>, int)> GetExternalErrorLogs(ExternalErrorLogGetRequest request, int index, int count)
        {
            var predicate = PredicateBuilder.True<Model.ExternalErrorLog>();

            if (request.ErrorType.HasValue)
            {
                predicate = predicate.And(x => x.ErrorType == request.ErrorType);
            }

            if (request.ErrorSite.HasValue)
            {
                predicate = predicate.And(x => x.ErrorSite == request.ErrorSite);
            }

            if (request.ErrorStatus.HasValue)
            {
                predicate = predicate.And(x => x.ErrorStatus == request.ErrorStatus);
            }

            if (!string.IsNullOrEmpty(request.DisputeGuid))
            {
                predicate = predicate.And(x => x.DisputeGuid.ToString() == request.DisputeGuid);
            }

            if (request.ErrorOwner.HasValue)
            {
                predicate = predicate.And(x => x.ErrorOwner == request.ErrorOwner);
            }

            if (request.ErrorCreatedBeforeDate.HasValue)
            {
                predicate = predicate.And(x => x.CreatedDate <= request.ErrorCreatedBeforeDate);
            }

            if (request.ErrorCreatedAfterDate.HasValue)
            {
                predicate = predicate.And(x => x.CreatedDate > request.ErrorCreatedAfterDate);
            }

            var result = await Context.ExternalErrorLogs.Where(predicate).ToListAsync();

            if (request.SortDirection.HasValue && request.SortDirection.Value == (byte)SortDir.Asc)
            {
                result = result.OrderBy(x => x.CreatedDate).ToList();
            }
            else
            {
                result = result.OrderByDescending(x => x.CreatedDate).ToList();
            }

            var totalCount = result.Count;
            result = await result.Skip(index).Take(count).ToListAsync();

            return (result, totalCount);
        }

        public async Task<DateTime?> GetLastModifiedDate(int externalErrorLogId)
        {
            var dates = await Context.ExternalErrorLogs
            .Where(c => c.ExternalErrorLogId == externalErrorLogId)
            .Select(d => d.ModifiedDate)
            .ToListAsync();

            return dates.FirstOrDefault();
        }
    }
}
