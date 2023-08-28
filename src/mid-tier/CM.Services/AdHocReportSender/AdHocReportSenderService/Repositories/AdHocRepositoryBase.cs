using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using CM.Services.AdHocReportSender.AdHocReportSenderService.ExternalContexts;
using Microsoft.EntityFrameworkCore;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Repositories
{
    public class AdHocRepositoryBase<T> : IAdHocRepositoryBase<T>
        where T : class
    {
        protected AdHocRepositoryBase(AdHocReportContext adHocContext, RtbDmsContext rtbDmsContext)
        {
            AdHocContext = adHocContext;
            AdHocDbSet = adHocContext.Set<T>();

            RtbDmsContext = rtbDmsContext;
            RtbDmsDbSet = rtbDmsContext.Set<T>();
        }

        public DbSet<T> AdHocDbSet { get; set; }

        public DbSet<T> RtbDmsDbSet { get; set; }

        protected AdHocReportContext AdHocContext { get; }

        protected RtbDmsContext RtbDmsContext { get; }

        public void Attach(T obj)
        {
            AdHocDbSet.Attach(obj);
            AdHocContext.Entry(obj).State = EntityState.Modified;
        }

        public async Task<bool> Delete(long id)
        {
            var obj = await AdHocDbSet.FindAsync(id);
            var prop = obj.GetType().GetProperty("IsDeleted");

            if (prop != null)
            {
                prop.SetValue(obj, true);
                AdHocDbSet.Attach(obj);
                AdHocContext.Entry(obj).State = EntityState.Modified;

                return true;
            }

            return false;
        }

        public async Task<ICollection<T>> FindAllAsync(Expression<Func<T, bool>> where)
        {
            return await AdHocDbSet.Where(where).ToListAsync();
        }

        public async Task<ICollection<T>> GetAllAsync()
        {
            return await AdHocDbSet.ToListAsync();
        }

        public async Task<T> GetByIdAsync(long id)
        {
            return await AdHocDbSet.FindAsync(id);
        }

        public async Task<T> GetNoTrackingByIdAsync(Expression<Func<T, bool>> where)
        {
            return await AdHocDbSet.AsNoTracking().SingleOrDefaultAsync(where);
        }

        public async Task<T> InsertAsync(T obj)
        {
            var inserted = await AdHocDbSet.AddAsync(obj);
            return inserted.Entity;
        }
    }
}
