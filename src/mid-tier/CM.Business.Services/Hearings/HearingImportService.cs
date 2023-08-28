using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Hearing;
using CM.Business.Entities.Models.HearingReporting;
using CM.Business.Services.SystemSettingsService;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.UserResolverService;
using Serilog;

namespace CM.Business.Services.Hearings;

public class HearingImportService : CmServiceBase, IHearingImportService
{
    private readonly IHearingAuditLogService _hearingAuditLogService;

    public HearingImportService(IMapper mapper, IUnitOfWork unitOfWork, IUserResolver userResolver, ISystemSettingsService systemSettingsService, IHearingAuditLogService hearingAuditLogService)
        : base(unitOfWork, mapper)
    {
        UserResolver = userResolver;
        SystemSettingsService = systemSettingsService;
        _hearingAuditLogService = hearingAuditLogService;
    }

    private IUserResolver UserResolver { get; }

    private ISystemSettingsService SystemSettingsService { get; }

    public Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        throw new NotImplementedException();
    }

    public async Task<ImportScheduleResponse> CreateImportSchedule(ImportScheduleRequest request, DateTime importStart)
    {
        try
        {
            var importHearing = MapperService.Map<ImportScheduleRequest, HearingImport>(request);
            importHearing.ImportStatus = ImportStatus.InProgress;
            importHearing.ImportStartDateTime = importStart;

            await UnitOfWork.ImportHearingRepository.InsertAsync(importHearing);
            var result = await UnitOfWork.Complete();

            if (result.CheckSuccess())
            {
                return MapperService.Map<HearingImport, ImportScheduleResponse>(importHearing);
            }
        }
        catch
        {
            return null;
        }

        return null;
    }

    public async Task<ImportScheduleResponse> UpdateImportSchedule(int hearingImportId, ImportStatus status, ImportLogging importLogging)
    {
        var importHearingToPatch = await UnitOfWork.ImportHearingRepository.GetByIdAsync(hearingImportId);

        importHearingToPatch.ImportEndDateTime = DateTime.UtcNow;
        importHearingToPatch.ImportStatus = status;
        importHearingToPatch.ImportProcessLog = importLogging.GetLogs();

        UnitOfWork.ImportHearingRepository.Attach(importHearingToPatch);
        var result = await UnitOfWork.Complete();

        if (result.CheckSuccess())
        {
            return MapperService.Map<HearingImport, ImportScheduleResponse>(importHearingToPatch);
        }

        return null;
    }

    public async Task<ImportScheduleResponse> GetHearingImport(int hearingImportId)
    {
        var hearingImport = await UnitOfWork.ImportHearingRepository.GetByIdAsync(hearingImportId);
        if (hearingImport != null)
        {
            return MapperService.Map<HearingImport, ImportScheduleResponse>(hearingImport);
        }

        return null;
    }

    public async Task<List<ImportScheduleResponse>> GetHearingImports(int index, int count)
    {
        if (count == 0)
        {
            count = Pagination.DefaultPageSize;
        }

        var hearingImports = await UnitOfWork.ImportHearingRepository.GetHearingImports(index, count);
        if (hearingImports != null)
        {
            return MapperService.Map<List<HearingImport>, List<ImportScheduleResponse>>(hearingImports);
        }

        return new List<ImportScheduleResponse>();
    }

    public async Task<bool> CheckHearingImportExistence(int importFileId)
    {
        var exists = await UnitOfWork.ImportHearingRepository.GetByFileIdAsync(importFileId);
        return exists;
    }

    public async Task<ImportStatus> StartImportProcess(int fileId, ImportLogging importLogging)
    {
        var fileInfo = await UnitOfWork.CommonFileRepository.GetByIdAsync(fileId);
        importLogging.AddLog($"Starting file import - {fileInfo.FileName}");

        var checkResult = await CheckCsv(fileId, importLogging);

        if (!checkResult)
        {
            importLogging.Status = ImportStatus.Error;
            return importLogging.Status;
        }

        var importResult = await StartImport(fileId, importLogging);

        if (importResult == ImportStatus.Error)
        {
            return importLogging.Status;
        }

        importLogging.Status = ImportStatus.Complete;
        return importLogging.Status;
    }

    private static int GetUserId(ScheduleCsv scheduleCsv)
    {
        try
        {
            var systemUserId = scheduleCsv.UserId.Split('-')[1];
            return int.Parse(systemUserId);
        }
        catch (Exception exc)
        {
            throw new InvalidCastException("Invalid UserId value", exc);
        }
    }

    private static Data.Model.ConferenceBridge GetRandom(ref IList<Data.Model.ConferenceBridge> bridges)
    {
        var rnd = new Random();
        var index = rnd.Next(0, bridges.Count);
        var bridge = bridges[index];
        bridges.RemoveAt(index);
        return bridge;
    }

    private async Task<ImportStatus> StartImport(int fileId, ImportLogging importLogging)
    {
        Log.Information("StartImport");
        var totalCount = 0;
        try
        {
            importLogging.AddLog("Starting hearing import process");
            var scheduleDataList = await GetScheduleDataListAsync(await GetRootFileFolderAsync(), fileId);

            var groupedData = scheduleDataList.GroupBy(x => x.DateAssigned);
            foreach (var day in groupedData)
            {
                var dayCount = 0;
                var availableConferenceBridges = await UnitOfWork
                                                .ConferenceBridgeRepository
                                                .GetAvailableBridges(Convert.ToDateTime(day.Key));

                foreach (var scheduleData in day)
                {
                    var systemUserId = GetUserId(scheduleData);
                    var startDate = Convert.ToDateTime(scheduleData.DateAssigned + " " + scheduleData.Time);
                    var endDate = scheduleData.EndTime.HasValue ? Convert.ToDateTime(scheduleData.DateAssigned + " " + scheduleData.EndTime) :
                                    Convert.ToDateTime(scheduleData.DateAssigned + " " + scheduleData.Time).AddHours(1);

                    var existedHearing = await UnitOfWork.HearingRepository.IsHearingExist(
                        systemUserId,
                        startDate.ToUniversalTime(),
                        endDate.ToUniversalTime());

                    if (existedHearing)
                    {
                        Log.Warning("{RowNumber}", scheduleData.RowNumber.ToString());
                        importLogging.AddLog($"Error, duplicate hearing on row - {scheduleData.RowNumber}");
                        continue;
                    }

                    Data.Model.ConferenceBridge bridge;

                    if (availableConferenceBridges.Count > 0)
                    {
                        bridge = GetRandom(ref availableConferenceBridges);
                    }
                    else
                    {
                        importLogging.AddLog($"Not enough open conference bridges to create hearing for Row {scheduleData.RowNumber} for User ID {scheduleData.UserId} on {scheduleData.DateAssigned + ":" + scheduleData.Time}");
                        continue;
                    }

                    Log.Information("Start to create hearing");
                    var hearing = new Hearing
                    {
                        HearingOwner = systemUserId,
                        HearingPriority = (byte)Enum.Parse(typeof(HearingPriority), scheduleData.Priority, true),
                        LocalStartDateTime = Convert.ToDateTime(scheduleData.DateAssigned + " " + scheduleData.Time),
                        LocalEndDateTime = scheduleData.EndTime.HasValue ?
                            Convert.ToDateTime(scheduleData.DateAssigned + " " + scheduleData.EndTime) :
                            Convert.ToDateTime(scheduleData.DateAssigned + " " + scheduleData.Time).AddHours(1),
                        HearingStartDateTime = Convert.ToDateTime(scheduleData.DateAssigned + " " + scheduleData.Time).ToUniversalTime(),
                        HearingEndDateTime = scheduleData.EndTime.HasValue ?
                            Convert.ToDateTime(scheduleData.DateAssigned + " " + scheduleData.EndTime).ToUniversalTime() :
                            Convert.ToDateTime(scheduleData.DateAssigned + " " + scheduleData.Time).AddHours(1).ToUniversalTime(),
                        ConferenceBridgeId = bridge.ConferenceBridgeId,
                        HearingType = (byte)HearingType.ConferenceCall,
                        CreatedDate = DateTime.Now.ToUniversalTime(),
                        CreatedBy = Constants.UndefinedUserId,
                        IsDeleted = false,
                        HearingDetails = await GetHearingDetailsAsync(bridge.ConferenceBridgeId)
                    };

                    await UnitOfWork.HearingRepository.InsertAsync(hearing);
                    Log.Information("hearing inserted");
                    var result = await UnitOfWork.Complete();
                    Log.Information("hearing sent to complete");
                    if (result.CheckSuccess())
                    {
                        await _hearingAuditLogService.CreateAsync(HearingAuditLogCase.CreateHearingFromSchedule, hearing, null);
                        totalCount += 1;
                        dayCount += 1;
                    }
                    else
                    {
                        Log.Information("Error when save hearing.");
                    }
                }

                importLogging.AddLog($"{dayCount} hearings created for {day.Key}");
            }

            importLogging.AddLog($"Totally {totalCount} hearings created.");

            importLogging.AddLog("Process ended successfully - no errors");
            importLogging.Status = ImportStatus.Complete;
            return importLogging.Status;
        }
        catch (Exception ex)
        {
            Log.Error(ex, "StartImport exception");
            importLogging.Status = ImportStatus.Error;
            importLogging.AddLog("Process ended with errors");
            return importLogging.Status;
        }
    }

    private async Task<string> GetHearingDetailsAsync(int conferenceBridgeId)
    {
        var conferenceBridge = await UnitOfWork.ConferenceBridgeRepository.GetByIdAsync(conferenceBridgeId);

        var hearingDetails = new StringBuilder();
        hearingDetails.AppendLine("<div>");
        hearingDetails.AppendLine("<table style=\"width:100%;\">");
        hearingDetails.AppendLine("<thead></thead>");
        hearingDetails.AppendLine("<tbody>");
        hearingDetails.AppendLine("<tr>");
        hearingDetails.AppendLine("<td class=\"hearing-details\" width=\"250px\" style=\"width:250px; vertical-align:top;\">");
        hearingDetails.AppendLine("Teleconference Number:");
        hearingDetails.AppendLine("</td>");
        hearingDetails.AppendLine("<td>");

        if (!string.IsNullOrEmpty(conferenceBridge.DialInNumber1) && !string.IsNullOrEmpty(conferenceBridge.DialInNumber2))
        {
            hearingDetails.AppendLine("<b>" + conferenceBridge.DialInNumber1 + "</b> or<br/>" + conferenceBridge.DialInNumber2);
        }
        else if (!string.IsNullOrEmpty(conferenceBridge.DialInNumber1))
        {
            hearingDetails.AppendLine("<b>" + conferenceBridge.DialInNumber1 + "</b>");
        }
        else if (!string.IsNullOrEmpty(conferenceBridge.DialInNumber2))
        {
            hearingDetails.AppendLine(conferenceBridge.DialInNumber2);
        }

        hearingDetails.AppendLine("</td>");
        hearingDetails.AppendLine("</tr>");
        hearingDetails.AppendLine("<tr>");
        hearingDetails.AppendLine("<td class=\"hearing-details\" width=\"250px\" style=\"width:250px;vertical-align:top;\">");
        hearingDetails.AppendLine("Teleconference Access Code:");
        hearingDetails.AppendLine("</td>");
        hearingDetails.AppendLine("<td>");
        hearingDetails.AppendLine("<b>" + conferenceBridge.ParticipantCode + "</b>");
        hearingDetails.AppendLine("</td>");
        hearingDetails.AppendLine("</tr>");
        hearingDetails.AppendLine("</tbody>");
        hearingDetails.AppendLine("</table>");
        hearingDetails.AppendLine("</div>");
        hearingDetails.AppendLine("<br/>");
        hearingDetails.AppendLine("<p>Please call into your hearing using the teleconference access code above.</p>");

        return hearingDetails.ToString();
    }

    private async Task<bool> CheckCsv(int fileId, ImportLogging importLogging)
    {
        var scheduleDataList = await GetScheduleDataListAsync(await GetRootFileFolderAsync(), fileId);

        if (!scheduleDataList.Any())
        {
            var fileInfo = await UnitOfWork.CommonFileRepository.GetByIdAsync(fileId);
            importLogging.AddLog($"Error opening or reading file - {fileInfo.FileName}");
            importLogging.Status = ImportStatus.Error;
            return false;
        }

        importLogging.AddLog("File imported, starting validation");

        var duplicatesExist = false;
        foreach (var scheduleData in scheduleDataList)
        {
            var systemUserId = GetUserId(scheduleData);
            var startDate = Convert.ToDateTime(scheduleData.DateAssigned + " " + scheduleData.Time);
            var endDate = scheduleData.EndTime.HasValue ? Convert.ToDateTime(scheduleData.DateAssigned + " " + scheduleData.EndTime) :
                            Convert.ToDateTime(scheduleData.DateAssigned + " " + scheduleData.Time).AddHours(1);

            var existedHearing = await UnitOfWork.HearingRepository.IsHearingExist(
                        systemUserId,
                        startDate.ToUniversalTime(),
                        endDate.ToUniversalTime());

            if (existedHearing)
            {
                duplicatesExist = true;
                importLogging.AddLog($"Error, duplicate hearing on row - {scheduleData.RowNumber}");
            }
        }

        if (duplicatesExist)
        {
            importLogging.Status = ImportStatus.Error;
            return false;
        }

        importLogging.AddLog("No duplicate conference bridge found, all hearings are new and unique");
        importLogging.Status = ImportStatus.Complete;

        return true;
    }

    private async Task<string> GetRootFileFolderAsync()
    {
        var root = await SystemSettingsService.GetValueAsync<string>(SettingKeys.CommonFileStorageRoot);
        return root;
    }

    private async Task<IList<ScheduleCsv>> GetScheduleDataListAsync(string rootFileFolder, int fileId)
    {
        var fileInfo = await UnitOfWork.CommonFileRepository.GetByIdAsync(fileId);
        var scheduleDataList = await System.IO.File.ReadAllLinesAsync(Path.Combine(rootFileFolder, fileInfo.FilePath));

        var result = scheduleDataList.Skip(1).Select(x => x.Split(','))
            .Where(x => x[0] != string.Empty)
            .Select((x, i) => new ScheduleCsv
            {
                RowNumber = i + 2,
                UserId = x[0],
                FirstName = x[1],
                LastName = x[2],
                Region = x[3],
                DateAssigned = x[4],
                Time = TimeSpan.Parse(x[5]),
                Priority = x[6],
                EndTime = x.Length > 7 ? TimeSpan.Parse(x[7]) : null
            });

        return result.ToList();
    }
}