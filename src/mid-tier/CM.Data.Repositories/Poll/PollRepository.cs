using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Business.Entities.Models.Poll;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.Poll
{
    public class PollRepository : CmRepository<Model.Poll>, IPollRepository
    {
        public PollRepository(CaseManagementContext context)
        : base(context)
        {
        }

        public async Task<DateTime?> GetLastModifiedDate(int pollId)
        {
            var dates = await Context.Polls
            .Where(c => c.PollId == pollId)
            .Select(d => d.ModifiedDate)
            .ToListAsync();

            return dates?.FirstOrDefault();
        }

        public async Task<List<Model.Poll>> GetPolls(PollGetRequest request)
        {
            var result = new List<Model.Poll>();

            var predicate = PredicateBuilder.True<Data.Model.Poll>();

            if (request.PollStatuses != null && request.PollStatuses.Any())
            {
                predicate = predicate.And(x => request.PollStatuses.Contains((byte)x.PollStatus));
            }

            if (request.PollType.HasValue)
            {
                predicate = predicate.And(x => x.PollType == request.PollType.Value);
            }

            if (request.PollSite != null && request.PollSite.Any())
            {
                predicate = predicate.And(x => request.PollSite.Contains((byte)x.PollSite));
            }

            var polls = await Context.Polls.Where(predicate).ToListAsync();

            return polls;
        }

        public async Task<bool> IsChildsExists(int pollId)
        {
            var isExists = await Context.PollResponses.AnyAsync(x => x.PollId == pollId);
            return isExists;
        }

        public async Task<bool> IsExists(string pollTitle)
        {
            var isAny = await Context.Polls.AnyAsync(x => x.PollTitle == pollTitle);
            return isAny;
        }

        public async Task<bool> IsPollExists(int pollId)
        {
            var isPollExists = await Context.Polls.AnyAsync(x => x.PollId == pollId);
            return isPollExists;
        }
    }
}
