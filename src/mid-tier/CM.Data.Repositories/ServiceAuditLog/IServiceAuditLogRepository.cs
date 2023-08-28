using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.ServiceAuditLog
{
    public interface IServiceAuditLogRepository : IRepository<Model.ServiceAuditLog>
    {
        Task<List<Data.Model.ServiceAuditLog>> GetByPredicate(Expression<Func<Model.ServiceAuditLog, bool>> predicate, int count, int index);

        Task<int> GetByPredicateTotalCount(Expression<Func<Model.ServiceAuditLog, bool>> predicate);
    }
}
