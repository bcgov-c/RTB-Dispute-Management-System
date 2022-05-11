using System;
using System.Threading.Tasks;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.Remedy;

public interface IRemedyRepository : IRepository<Model.Remedy>
{
    Task<DateTime?> GetLastModifiedDate(int remedyId);

    Task<Model.Remedy> GetRemedyWithChildsAsync(int remedyId);
}