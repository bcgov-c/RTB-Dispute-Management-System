using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.SubstitutedService;

public interface ISubstitutedServiceRepository : IRepository<Model.SubstitutedService>
{
    Task<DateTime?> GetLastModifiedDate(int id);

    Task<List<Model.SubstitutedService>> GetSubmittedSubServices(DateTime utcStart, DateTime utcEnd);
}