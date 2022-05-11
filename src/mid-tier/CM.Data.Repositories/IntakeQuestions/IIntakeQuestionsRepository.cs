using System;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.IntakeQuestions;

public interface IIntakeQuestionsRepository : IRepository<IntakeQuestion>
{
    Task<DateTime?> GetLastModifiedDateAsync(int intakeQuestionId);

    Task<bool> IntakeQuestionExists(Guid disputeGuid, string questionName);
}