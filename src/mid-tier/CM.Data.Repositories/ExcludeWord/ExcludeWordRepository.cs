using System.Collections.Generic;
using System.Linq;
using CM.Data.Model;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.ExcludeWord;

public class ExcludeWordRepository : CmRepository<AccessCodeExcludeWord>, IExcludeWordRepository
{
    public ExcludeWordRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public IEnumerable<string> GetAllWords()
    {
        var excludedWords = Context.AccessCodeExcludeWords.Select(w => w.ExcludeWord);
        return excludedWords;
    }
}