using System;
using System.Linq;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.IntakeQuestions;

public class IntakeQuestionsRepository : CmRepository<IntakeQuestion>, IIntakeQuestionsRepository
{
    public IntakeQuestionsRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<bool> IntakeQuestionExists(Guid disputeGuid, string questionName)
    {
        return await Context.IntakeQuestions.AnyAsync(x => x.DisputeGuid == disputeGuid && x.QuestionName == questionName);
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(int intakeQuestionId)
    {
        var lastModifiedDate = await Context.IntakeQuestions
            .Where(i => i.IntakeQuestionId == intakeQuestionId)
            .Select(iq => iq.ModifiedDate)
            .ToListAsync();

        return lastModifiedDate.FirstOrDefault();
    }
}