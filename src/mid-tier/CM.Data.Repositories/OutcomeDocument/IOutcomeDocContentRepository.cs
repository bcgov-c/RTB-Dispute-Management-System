using System;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.OutcomeDocument;

public interface IOutcomeDocContentRepository : IRepository<OutcomeDocContent>
{
    Task<DateTime?> GetLastModifiedDate(int outcomeDocContentId);
}