using System;
using System.Linq;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.Poll
{
    public class PollResponseRepository : CmRepository<Model.PollResponse>, IPollResponseRepository
    {
        public PollResponseRepository(CaseManagementContext context)
        : base(context)
        {
        }

        public async Task<DateTime?> GetLastModifiedDate(int pollResponseId)
        {
            var dates = await Context.PollResponses
            .Where(c => c.PollResponseId == pollResponseId)
            .Select(d => d.ModifiedDate)
            .ToListAsync();

            return dates?.FirstOrDefault();
        }
    }
}
