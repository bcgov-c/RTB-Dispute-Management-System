using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.ServiceAuditLog
{
    public class ServiceAuditLogRepository : CmRepository<Model.ServiceAuditLog>, IServiceAuditLogRepository
    {
        public ServiceAuditLogRepository(CaseManagementContext context)
        : base(context)
        {
        }

        public async Task<List<Model.ServiceAuditLog>> GetByPredicate(Expression<Func<Model.ServiceAuditLog, bool>> predicate, int count, int index)
        {
            var serviceAuditLogs = await Context
                .ServiceAuditLogs
                .Where(predicate)
                .ApplyPaging(count, index)
                .ToListAsync();

            return serviceAuditLogs;
        }

        public async Task<int> GetByPredicateTotalCount(Expression<Func<Model.ServiceAuditLog, bool>> predicate)
        {
            var totalCount = await Context.ServiceAuditLogs.CountAsync(predicate);

            return totalCount;
        }
    }
}
