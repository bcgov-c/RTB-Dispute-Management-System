using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using CM.Data.Repositories.Notes;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.OnlineMeeting
{
    public class OnlineMeetingRepository : CmRepository<Model.OnlineMeeting>, IOnlineMeetingRepository
    {
        public OnlineMeetingRepository(CaseManagementContext context)
        : base(context)
        {
        }

        public async Task<DateTime?> GetLastModifiedDate(int onlineMeetingId)
        {
            var dates = await Context.OnlineMeetings
            .Where(n => n.OnlineMeetingId == onlineMeetingId)
            .Select(n => n.ModifiedDate)
            .ToListAsync();

            return dates?.FirstOrDefault();
        }
    }
}
