using System.Collections.Generic;
using CM.Data.Model;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.ExcludeWord;

public interface IExcludeWordRepository : IRepository<AccessCodeExcludeWord>
{
    IEnumerable<string> GetAllWords();
}