using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Repositories
{
    public interface IAdHocRepositoryBase<T>
        where T : class
    {
        void Attach(T obj);

        Task<ICollection<T>> FindAllAsync(Expression<Func<T, bool>> where);

        Task<ICollection<T>> GetAllAsync();

        Task<T> GetByIdAsync(long id);

        Task<T> GetNoTrackingByIdAsync(Expression<Func<T, bool>> where);

        Task<T> InsertAsync(T obj);

        Task<bool> Delete(long id);
    }
}
