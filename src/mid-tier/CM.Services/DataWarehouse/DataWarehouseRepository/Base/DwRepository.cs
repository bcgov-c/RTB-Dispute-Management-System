using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using CM.Services.DataWarehouse.DataWarehouseDataModel;
using Microsoft.EntityFrameworkCore;

namespace CM.Services.DataWarehouse.DataWarehouseRepository.Base;

public class DwRepository<T> : IDwRepository<T>
    where T : class
{
    protected DwRepository(DataWarehouseContext context)
    {
        Context = context;
        DbSet = context.Set<T>();
    }

    protected List<string> TrackedProperties { get; set; }

    protected DataWarehouseContext Context { get; }

    private DbSet<T> DbSet { get; set; }

    public async Task<T> GetByIdAsync(int id)
    {
        return await DbSet.FindAsync(id);
    }

    public T GetById(int id)
    {
        return DbSet.Find(id);
    }

    public async Task<ICollection<T>> GetAllAsync()
    {
        return await DbSet.ToListAsync();
    }

    public async Task<ICollection<T>> FindAllAsync(Expression<Func<T, bool>> where)
    {
        return await DbSet.Where(where).ToListAsync();
    }

    public async Task<T> InsertAsync(T obj)
    {
        var inserted = await DbSet.AddAsync(obj);

        return inserted.Entity;
    }

    public void Update(T obj)
    {
        DbSet.Update(obj);
    }

    public void Attach(T obj)
    {
        DbSet.Attach(obj);
        Context.Entry(obj).State = EntityState.Modified;
    }

    public async Task<bool> Delete(int id)
    {
        var obj = await DbSet.FindAsync(id);
        var prop = obj.GetType().GetProperty("IsDeleted");

        if (prop == null)
        {
            return false;
        }

        prop.SetValue(obj, true);
        DbSet.Attach(obj);
        Context.Entry(obj).State = EntityState.Modified;

        return true;
    }

    public async Task<T> GetNoTrackingByIdAsync(Expression<Func<T, bool>> where)
    {
        return await DbSet.AsNoTracking().SingleOrDefaultAsync(where);
    }
}