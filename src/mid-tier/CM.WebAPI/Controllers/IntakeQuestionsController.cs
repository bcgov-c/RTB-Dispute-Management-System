using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.IntakeQuestion;
using CM.Business.Services.IntakeQuestions;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.WebAPI.Filters;
using CM.WebAPI.WebApiHelpers;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
[Route("api/dispute/intakequestions")]
public class IntakeQuestionsController : BaseController
{
    private readonly IIntakeQuestionsService _intakeQuestionsService;
    private readonly IMapper _mapper;

    public IntakeQuestionsController(IIntakeQuestionsService intakeQuestionsService, IMapper mapper)
    {
        _intakeQuestionsService = intakeQuestionsService;
        _mapper = mapper;
    }

    [HttpPost("{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Post([FromBody]List<IntakeQuestionRequest> intakeQuestions, Guid disputeGuid)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var disputeExists = await _intakeQuestionsService.IsDisputeExists(disputeGuid);
        if (!disputeExists)
        {
            return BadRequest(string.Format(ApiReturnMessages.DisputeDoesNotExist, disputeGuid));
        }

        foreach (var intakeQuestion in intakeQuestions)
        {
            var duplicateRecordExists = await _intakeQuestionsService.CheckDuplicateRecord(disputeGuid, intakeQuestion.QuestionName);
            if (duplicateRecordExists)
            {
                return BadRequest(string.Format(ApiReturnMessages.DuplicateIndex, disputeGuid, intakeQuestion.QuestionName));
            }
        }

        DisputeSetContext(disputeGuid);
        var newQuestions = await _intakeQuestionsService.PostManyAsync(intakeQuestions, disputeGuid);
        if (newQuestions != null)
        {
            if (newQuestions.Count > 0)
            {
                EntityIdSetContext(newQuestions.First().IntakeQuestionId);
            }

            return Ok(newQuestions);
        }

        return BadRequest();
    }

    [HttpGet("{disputeGuid:Guid}")]
    [AuthorizationRequired(new[] { RoleNames.Admin, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Get(Guid disputeGuid)
    {
        var intakeQuestions = await _intakeQuestionsService.GetAllAsync(disputeGuid);
        return Ok(intakeQuestions);
    }

    [HttpPatch("{questionId:int}")]
    [ApplyConcurrencyCheck]
    [AuthorizationRequired(new[] { RoleNames.AdminLimited, RoleNames.ExtendedUser })]
    public async Task<IActionResult> Patch([FromBody]JsonPatchDocumentExtension<IntakeQuestionRequest> intakeQuestion, int questionId)
    {
        if (CheckModified(_intakeQuestionsService, questionId))
        {
            return StatusConflicted();
        }

        var originalIntakeQuestion = await _intakeQuestionsService.GetNoTrackingIntakeQuestionAsync(questionId);

        if (originalIntakeQuestion != null)
        {
            var intakeToPatch = _mapper.Map<IntakeQuestion, IntakeQuestionRequest>(originalIntakeQuestion);
            intakeQuestion.ApplyTo(intakeToPatch);

            await TryUpdateModelAsync(intakeToPatch);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var questionName = intakeQuestion.GetValue<string>("/question_name");
            if (questionName.Exists)
            {
                var duplicateRecordExists = await _intakeQuestionsService.CheckDuplicateRecord(originalIntakeQuestion.DisputeGuid, questionName.Value);
                if (duplicateRecordExists)
                {
                    return BadRequest(string.Format(ApiReturnMessages.DuplicateIndex, originalIntakeQuestion.DisputeGuid, questionName.Value));
                }
            }

            DisputeSetContext(originalIntakeQuestion.DisputeGuid);
            var result = await _intakeQuestionsService.PatchAsync(intakeToPatch, questionId, originalIntakeQuestion.DisputeGuid);
            result.DisputeGuid = originalIntakeQuestion.DisputeGuid;
            EntityIdSetContext(questionId);
            return Ok(result);
        }

        return NotFound();
    }
}