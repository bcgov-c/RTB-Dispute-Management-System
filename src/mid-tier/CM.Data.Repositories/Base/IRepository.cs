using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace CM.Data.Repositories.Base;

public interface IRepository<T>
    where T : class
{
    void Attach(T obj);

    Task<ICollection<T>> FindAllAsync(Expression<Func<T, bool>> where);

    Task<ICollection<T>> GetAllAsync();

    T GetById(int id);

    T GetByGuid(Guid guid);

    Task<T> GetByIdAsync(int id, bool ignoreFilter = false);

    Task<T> GetByGuidAsync(Guid guid);

    Task<T> GetNoTrackingByIdAsync(Expression<Func<T, bool>> where, bool ignoreFilter = false);

    Task<T> InsertAsync(T obj);

    void Update(T obj);

    Task<bool> Delete(int id);

    Task<bool> Delete(Guid guid);
}