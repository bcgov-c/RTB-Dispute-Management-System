using System;
using System.Threading.Tasks;
using CM.Business.Entities.Models.Hearing;
using CM.Business.Services.Files;
using CM.Business.Services.Hearings;
using CM.Common.Utilities;
using CM.WebAPI.Filters;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.Controllers;

[Produces(Application.Json)]
public class ScheduleController : BaseController
{
    private readonly ICommonFileService _commonFileService;
    private readonly IHearingImportService _hearingImportService;
    private readonly IServiceScopeFactory _serviceScopeFactory;

    public ScheduleController(IHearingImportService hearingImportService, ICommonFileService commonFileService, IServiceScopeFactory serviceScopeFactory)
    {
        _hearingImportService = hearingImportService;
        _commonFileService = commonFileService;
        _serviceScopeFactory = serviceScopeFactory;
    }

    [AuthorizationRequired(new[] { RoleNames.Admin })]
    [HttpPost("api/importschedule")]
    public async Task<IActionResult> PostImportSchedule([FromBody]ImportScheduleRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var isFileExists = await _commonFileService.GetAsync(request.ImportFileId);
        if (isFileExists == null)
        {
            return BadRequest(ApiReturnMessages.InvalidCommonFileIdProvided);
        }

        var hearingImportExist = await _hearingImportService.CheckHearingImportExistence(request.ImportFileId);
        if (!hearingImportExist)
        {
            var startDateTime = DateTime.UtcNow;
            var initialStateResult = await _hearingImportService.CreateImportSchedule(request, startDateTime);

            if (initialStateResult == null)
            {
                return BadRequest(ApiReturnMessages.HearingImportCreateFailed);
            }

            EntityIdSetContext(initialStateResult.HearingImportId);

            _ = Task.Run(async () =>
            {
                using var scope = _serviceScopeFactory.CreateScope();
                var hearingImportSer = scope.ServiceProvider.GetService<IHearingImportService>();
                var importProcessLog = new HearingImportLogging();

                if (hearingImportSer != null)
                {
                    var importStatus = await hearingImportSer.StartImportProcess(request.ImportFileId, importProcessLog);
                    await hearingImportSer.UpdateImportSchedule(initialStateResult.HearingImportId, importStatus, importProcessLog);
                }
            });

            return Ok(initialStateResult);
        }

        return BadRequest(ApiReturnMessages.HearingImportExist);
    }

    [AuthorizationRequired(new[] { RoleNames.Admin })]
    [HttpGet("api/importhistoryrecord/{hearingImportId:int}")]
    public async Task<IActionResult> GetImportSchedule(int hearingImportId)
    {
        var hearingImport = await _hearingImportService.GetHearingImport(hearingImportId);
        if (hearingImport != null)
        {
            return Ok(hearingImport);
        }

        return NotFound();
    }

    [AuthorizationRequired(new[] { RoleNames.Admin })]
    [HttpGet("api/importhistoryrecords/")]
    public async Task<IActionResult> GetImportSchedules(int index, int count)
    {
        var hearingImports = await _hearingImportService.GetHearingImports(index, count);
        if (hearingImports != null)
        {
            return Ok(hearingImports);
        }

        return NotFound();
    }
}