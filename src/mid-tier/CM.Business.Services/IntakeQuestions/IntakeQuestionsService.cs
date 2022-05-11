using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.IntakeQuestion;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using Serilog;

namespace CM.Business.Services.IntakeQuestions;

public class IntakeQuestionsService : CmServiceBase, IIntakeQuestionsService
{
    public IntakeQuestionsService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<Guid> ResolveDisputeGuid(int id)
    {
        var entity = await UnitOfWork.IntakeQuestionsRepository.GetNoTrackingByIdAsync(x => x.IntakeQuestionId == id);
        return entity?.DisputeGuid ?? Guid.Empty;
    }

    public async Task<List<IntakeQuestionResponse>> PostManyAsync(IEnumerable<IntakeQuestionRequest> intakeQuestions, Guid disputeGuid)
    {
        var createdIntakeQuestions = new List<IntakeQuestion>();

        foreach (var intakeQuestion in intakeQuestions)
        {
            var intake = MapperService.Map<IntakeQuestionRequest, IntakeQuestion>(intakeQuestion);
            intake.DisputeGuid = disputeGuid;
            intake.ModifiedDate = DateTime.UtcNow.GetCmDateTime();

            var result = await UnitOfWork.IntakeQuestionsRepository.InsertAsync(intake);
            var completeResult = await UnitOfWork.Complete();
            completeResult.AssertSuccess();
            createdIntakeQuestions.Add(result);
        }

        return MapperService.Map<List<IntakeQuestion>, List<IntakeQuestionResponse>>(createdIntakeQuestions);
    }

    public async Task<List<IntakeQuestionResponse>> GetAllAsync(Guid disputeGuid)
    {
        var intakeQuestions = await UnitOfWork.IntakeQuestionsRepository.FindAllAsync(i => i.DisputeGuid == disputeGuid);
        if (intakeQuestions.Count > 0)
        {
            return MapperService.Map<List<IntakeQuestion>, List<IntakeQuestionResponse>>(intakeQuestions.ToList());
        }

        return new List<IntakeQuestionResponse>();
    }

    public async Task<IntakeQuestionResponse> PatchAsync(IntakeQuestionRequest intakeQuestion, int questionId, Guid disputeGuid)
    {
        try
        {
            var intake = MapperService.Map<IntakeQuestionRequest, IntakeQuestion>(intakeQuestion);
            intake.IntakeQuestionId = questionId;
            intake.ModifiedDate = DateTime.UtcNow.GetCmDateTime();
            intake.DisputeGuid = disputeGuid;
            UnitOfWork.IntakeQuestionsRepository.Attach(intake);
            var result = await UnitOfWork.Complete();

            if (result.CheckSuccess())
            {
                return MapperService.Map<IntakeQuestion, IntakeQuestionResponse>(intake);
            }

            return null;
        }
        catch (Exception exc)
        {
            Log.Error(exc, "PatchAsync");
            throw;
        }
    }

    public async Task<IntakeQuestion> GetNoTrackingIntakeQuestionAsync(int id)
    {
        var intakeQuestion = await UnitOfWork.IntakeQuestionsRepository.GetNoTrackingByIdAsync(i => i.IntakeQuestionId == id);
        return intakeQuestion;
    }

    public async Task<bool> CheckDuplicateRecord(Guid disputeGuid, string questionName)
    {
        var isExists = await UnitOfWork.IntakeQuestionsRepository.IntakeQuestionExists(disputeGuid, questionName);
        return isExists;
    }

    public async Task<bool> IsDisputeExists(Guid disputeGuid)
    {
        var isExists = await UnitOfWork.DisputeRepository.GetDisputeByGuidAsync(disputeGuid);
        return isExists != null;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object intakeQuestionId)
    {
        var lastModifiedDate = await UnitOfWork.IntakeQuestionsRepository.GetLastModifiedDateAsync((int)intakeQuestionId);
        return lastModifiedDate;
    }
}