using System;
using System.Threading.Tasks;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.Trial;

public interface ITrialRepository : IRepository<Model.Trial>
{
    Task<DateTime?> GetLastModifiedDate(Guid guid);
}