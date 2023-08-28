using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.Poll;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.Poll
{
    public interface IPollRepository : IRepository<Model.Poll>
    {
        Task<DateTime?> GetLastModifiedDate(int pollId);

        Task<List<Model.Poll>> GetPolls(PollGetRequest request);

        Task<bool> IsChildsExists(int pollId);

        Task<bool> IsExists(string pollTitle);

        Task<bool> IsPollExists(int pollId);
    }
}
