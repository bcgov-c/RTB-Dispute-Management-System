using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace CM.Services.DataWarehouse.DataWarehouseRepository.Base;

public interface IDwRepository<T>
    where T : class
{
    void Attach(T obj);

    Task<ICollection<T>> FindAllAsync(Expression<Func<T, bool>> where);

    Task<ICollection<T>> GetAllAsync();

    T GetById(int id);

    Task<T> GetByIdAsync(int id);

    Task<T> GetNoTrackingByIdAsync(Expression<Func<T, bool>> where);

    Task<T> InsertAsync(T obj);

    void Update(T obj);

    Task<bool> Delete(int id);
}