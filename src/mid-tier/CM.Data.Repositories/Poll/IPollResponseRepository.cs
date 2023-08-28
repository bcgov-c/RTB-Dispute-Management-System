using System;
using System.Threading.Tasks;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.Poll
{
    public interface IPollResponseRepository : IRepository<Model.PollResponse>
    {
        Task<DateTime?> GetLastModifiedDate(int pollResponseId);
    }
}
