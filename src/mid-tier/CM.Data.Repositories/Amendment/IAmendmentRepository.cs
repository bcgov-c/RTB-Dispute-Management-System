using System;
using System.Threading.Tasks;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.Amendment;

public interface IAmendmentRepository : IRepository<Model.Amendment>
{
    Task<DateTime?> GetLastModifiedDate(int amendmentId);
}