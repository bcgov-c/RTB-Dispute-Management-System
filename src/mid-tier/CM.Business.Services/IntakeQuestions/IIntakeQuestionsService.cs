using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.IntakeQuestion;
using CM.Business.Services.Base;
using CM.Data.Model;

namespace CM.Business.Services.IntakeQuestions;

public interface IIntakeQuestionsService : IServiceBase, IDisputeResolver
{
    Task<List<IntakeQuestionResponse>> PostManyAsync(IEnumerable<IntakeQuestionRequest> intakeQuestions, Guid disputeGuid);

    Task<List<IntakeQuestionResponse>> GetAllAsync(Guid disputeGuid);

    Task<IntakeQuestionResponse> PatchAsync(IntakeQuestionRequest intakeQuestion, int questionId, Guid disputeGuid);

    Task<IntakeQuestion> GetNoTrackingIntakeQuestionAsync(int id);

    Task<bool> CheckDuplicateRecord(Guid disputeGuid, string questionName);

    Task<bool> IsDisputeExists(Guid disputeGuid);
}