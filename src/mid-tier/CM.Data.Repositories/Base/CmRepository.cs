using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using CM.Data.Model;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.Base;

public class CmRepository<T> : IRepository<T>
    where T : class
{
    protected CmRepository(CaseManagementContext context)
    {
        Context = context;
        DbSet = context.Set<T>();
    }

    public DbSet<T> DbSet { get; set; }

    protected CaseManagementContext Context { get; }

    public async Task<T> GetByIdAsync(int id, bool ignoreFilter = false)
    {
        if (ignoreFilter)
        {
            return await DbSet.FindAsync(id);
        }

        return await DbSet.FindAsync(id);
    }

    public async Task<T> GetByGuidAsync(Guid guid)
    {
        return await DbSet.FindAsync(guid);
    }

    public T GetById(int id)
    {
        return DbSet.Find(id);
    }

    public T GetByGuid(Guid guid)
    {
        return DbSet.Find(guid);
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
        var prop = obj?.GetType().GetProperty("IsDeleted");

        if (prop != null)
        {
            prop.SetValue(obj, true);
            DbSet.Attach(obj);
            Context.Entry(obj).State = EntityState.Modified;

            return true;
        }

        return false;
    }

    public async Task<bool> Delete(Guid guid)
    {
        var obj = await DbSet.FindAsync(guid);
        var prop = obj?.GetType().GetProperty("IsDeleted");

        if (prop != null)
        {
            prop.SetValue(obj, true);
            DbSet.Attach(obj);
            Context.Entry(obj).State = EntityState.Modified;

            return true;
        }

        return false;
    }

    public async Task<T> GetNoTrackingByIdAsync(Expression<Func<T, bool>> where, bool ignoreFilter = false)
    {
        if (ignoreFilter)
        {
            return await DbSet.AsNoTracking().IgnoreQueryFilters().SingleOrDefaultAsync(where);
        }

        return await DbSet.AsNoTracking().SingleOrDefaultAsync(where);
    }
}