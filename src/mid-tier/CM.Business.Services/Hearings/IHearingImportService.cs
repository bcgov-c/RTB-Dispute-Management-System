using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.Hearing;
using CM.Common.Utilities;

namespace CM.Business.Services.Hearings;

public interface IHearingImportService : IServiceBase
{
    Task<ImportScheduleResponse> CreateImportSchedule(ImportScheduleRequest request, DateTime importStart);

    Task<ImportScheduleResponse> UpdateImportSchedule(int hearingImportId, ImportStatus status, ImportLogging importLogging);

    Task<ImportScheduleResponse> GetHearingImport(int hearingImportId);

    Task<List<ImportScheduleResponse>> GetHearingImports(int index, int count);

    Task<bool> CheckHearingImportExistence(int importFileId);

    Task<ImportStatus> StartImportProcess(int fileId, ImportLogging importLogging);
}