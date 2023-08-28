using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.OnlineMeeting
{
    public interface IOnlineMeetingRepository : IRepository<Model.OnlineMeeting>
    {
        Task<DateTime?> GetLastModifiedDate(int onlineMeetingId);
    }
}
