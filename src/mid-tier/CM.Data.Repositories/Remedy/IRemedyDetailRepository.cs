using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.Remedy;

public interface IRemedyDetailRepository : IRepository<RemedyDetail>
{
    Task<DateTime?> GetLastModifiedDate(int remedyDetailId);

    Task<List<RemedyDetail>> GetByRemedyId(int remedyId);
}