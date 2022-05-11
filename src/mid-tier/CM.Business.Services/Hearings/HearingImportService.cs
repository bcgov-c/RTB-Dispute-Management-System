using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Hearing;
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

    private async Task<ImportStatus> StartImport(int fileId, ImportLogging importLogging)
    {
        Log.Information("StartImport");
        var loop1Count = 0;
        try
        {
            var loop2Data = new List<ScheduleCsv>();
            importLogging.AddLog("Starting hearing import process");
            var scheduleDataList = await GetScheduleDataListAsync(await GetRootFileFolderAsync(), fileId);

            importLogging.AddLog("Creating hearings with preferred conference bridges");
            foreach (var scheduleData in scheduleDataList)
            {
                LogHearingVerbose(scheduleData.RowNumber.ToString());
                var systemUserId = GetUserId(scheduleData);

                LogHearingVerbose(Convert.ToDateTime(scheduleData.DateAssigned + " " + scheduleData.Time).ToString(CultureInfo.InvariantCulture));
                LogHearingVerbose((scheduleData.EndTime.HasValue ? Convert.ToDateTime(scheduleData.DateAssigned + " " + scheduleData.EndTime) :
                    Convert.ToDateTime(scheduleData.DateAssigned + " " + scheduleData.Time).AddHours(1)).ToString(CultureInfo.InvariantCulture));
                var existedHearing = await UnitOfWork.HearingRepository.IsHearingExist(
                    systemUserId,
                    Convert.ToDateTime(scheduleData.DateAssigned + " " + scheduleData.Time),
                    scheduleData.EndTime.HasValue ? Convert.ToDateTime(scheduleData.DateAssigned + " " + scheduleData.EndTime) :
                        Convert.ToDateTime(scheduleData.DateAssigned + " " + scheduleData.Time).AddHours(1));
                if (existedHearing)
                {
                    Log.Warning("{RowNumber}", scheduleData.RowNumber.ToString());
                    importLogging.AddLog($"Error, duplicate hearing on row - {scheduleData.RowNumber}");
                    continue;
                }

                Data.Model.ConferenceBridge bridge;

                LogHearingVerbose(systemUserId + "; " + scheduleData.Time);

                var accordingConferenceBridges = await UnitOfWork.ConferenceBridgeRepository.GetAccordingSchedule(systemUserId, scheduleData.Time);

                if (accordingConferenceBridges.Count > 0)
                {
                    bridge = accordingConferenceBridges[0];
                }
                else
                {
                    accordingConferenceBridges = await UnitOfWork.ConferenceBridgeRepository.GetAccordingSchedule(systemUserId, null);
                    if (accordingConferenceBridges.Count > 0)
                    {
                        bridge = accordingConferenceBridges[0];
                    }
                    else
                    {
                        accordingConferenceBridges = await UnitOfWork.ConferenceBridgeRepository.GetAccordingSchedule(null, null);

                        if (accordingConferenceBridges == null || accordingConferenceBridges.Count < 1)
                        {
                            loop2Data.Add(scheduleData);
                            continue;
                        }

                        bridge = accordingConferenceBridges[0];
                    }
                }

                Log.Information("Start to create hearing - loop-1");
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
                Log.Information("hearing inserted- loop-1");
                var result = await UnitOfWork.Complete();
                Log.Information("hearing sent to complete - loop-1");
                if (result.CheckSuccess())
                {
                    await _hearingAuditLogService.CreateAsync(HearingAuditLogCase.CreateHearingFromSchedule, hearing, null);
                    loop1Count += 1;
                }
                else
                {
                    Log.Information("add to loop-2");
                    loop2Data.Add(scheduleData);
                }
            }

            importLogging.AddLog($"Total count of hearings created with preferred conference bridges is {loop1Count}");

            if (loop2Data.Count > 0)
            {
                importLogging.AddLog("Creating hearings that cannot use preferred conference bridges");
                var groupedLoop2Data = loop2Data.OrderBy(x => x.UserId.Split('-')[1]).GroupBy(x => x.DateAssigned).ToList();
                var openConferenceBridges = await UnitOfWork.ConferenceBridgeRepository.GetOpenConferenceBridges();
                var openBridgesCounts = openConferenceBridges.Count;
                var loop2Count = 0;

                foreach (var loop2List in groupedLoop2Data)
                {
                    if (loop2List.Count() > openBridgesCounts)
                    {
                        foreach (var loop in loop2List)
                        {
                            importLogging.AddLog($"Not enough conference bridges to create hearing for Row {loop.RowNumber} for User ID {loop.UserId} on {loop.DateAssigned} {loop.Time}");
                        }

                        continue;
                    }

                    var userId = UserResolver.GetUserId();

                    var loop2ListCount = 0;

                    foreach (var loop in loop2List.ToList())
                    {
                        var hearing = new Hearing
                        {
                            HearingType = (byte)HearingType.ConferenceCall,
                            HearingOwner = userId,
                            HearingPriority = (byte)Enum.Parse(typeof(HearingPriority), loop.Priority, true),
                            LocalStartDateTime = Convert.ToDateTime(loop.DateAssigned + " " + loop.Time),
                            LocalEndDateTime = loop.EndTime.HasValue ?
                                Convert.ToDateTime(loop.DateAssigned + " " + loop.EndTime) :
                                Convert.ToDateTime(loop.DateAssigned + " " + loop.Time).AddHours(1),
                            HearingStartDateTime = Convert.ToDateTime(loop.DateAssigned + " " + loop.Time).ToUniversalTime(),
                            HearingEndDateTime = loop.EndTime.HasValue ?
                                Convert.ToDateTime(loop.DateAssigned + " " + loop.EndTime).ToUniversalTime() :
                                Convert.ToDateTime(loop.DateAssigned + " " + loop.Time).AddHours(1).ToUniversalTime(),
                            ConferenceBridgeId = openConferenceBridges[loop2List.ToList().IndexOf(loop)].ConferenceBridgeId,
                            CreatedBy = Constants.UndefinedUserId,
                            IsDeleted = false,
                            HearingDetails = await GetHearingDetailsAsync(openConferenceBridges[loop2List.ToList().IndexOf(loop)].ConferenceBridgeId)
                        };

                        await UnitOfWork.HearingRepository.InsertAsync(hearing);
                        var result = await UnitOfWork.Complete();
                        if (result.CheckSuccess())
                        {
                            await _hearingAuditLogService.CreateAsync(HearingAuditLogCase.CreateHearingFromSchedule, hearing, null);
                            loop2ListCount += 1;
                        }
                    }

                    loop2Count += loop2ListCount;
                    openBridgesCounts -= loop2Count;
                    importLogging.AddLog($"{loop2ListCount} hearings created for {loop2List.Key} without preferred conference bridges");
                }

                importLogging.AddLog($"Total count of hearings created with open conference bridges is {loop2Count}");
            }

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
        hearingDetails.AppendLine("<div class=\"hearing - instructions - preset\">");
        hearingDetails.AppendLine("<p class=\"body-text\" style=\"font-size: 16px; line-height: 21px; text-align: left; color: #666;padding: 20px 0px 0px 0px;margin: 0px 0px 0px 0px;\">This hearing will be conducted by TELEPHONE CONFERENCE CALL. Please use one of the following phone numbers and your conference call participant code below to join the Telephone Conference Call. <b>Do not call more than 5 minutes prior to start time.</b></p>");
        hearingDetails.AppendLine("<ol class=\"sublist\" style=\"padding: 0px 0px 10px 0px; margin: 5px 0px 10px 30px; font-size:16px; line-height: 21px;\" >");
        hearingDetails.AppendLine("<li style=\"padding: 4px 0px 0px 0px; margin: 0px; color: #727272; font-size:16px; line-height: 21px;\">");
        hearingDetails.AppendLine("Phone a number below at the time of the conference start:");

        if (!string.IsNullOrEmpty(conferenceBridge.DialInNumber1))
        {
            hearingDetails.AppendLine("<br><span style=\"padding - left:10px;\">" + conferenceBridge.DialInNumber1 + " " + conferenceBridge.DialInDescription1 + "</span>");
        }

        if (!string.IsNullOrEmpty(conferenceBridge.DialInNumber2))
        {
            hearingDetails.AppendLine("<br><span style=\"padding-left:10px;\">" + conferenceBridge.DialInNumber2 + " " + conferenceBridge.DialInDescription2 + "</span>");
        }

        if (!string.IsNullOrEmpty(conferenceBridge.DialInNumber3))
        {
            hearingDetails.AppendLine("<br><span style=\"padding-left:10px;\">" + conferenceBridge.DialInNumber3 + " " + conferenceBridge.DialInDescription3 + "</span>");
        }

        hearingDetails.AppendLine("</li>");
        hearingDetails.AppendLine("<li style=\"padding: 4px 0px 0px 0px; margin: 0px; color: #727272; font-size:16px; line-height: 21px;\">Enter your participant access code from your notice of hearing " + conferenceBridge.ParticipantCode + "</li>");
        hearingDetails.AppendLine("<li style=\"padding: 4px 0px 0px 0px; margin: 0px; color: #727272; font-size:16px; line-height: 21px;\">Say your FULL NAME and press #</li>");
        hearingDetails.AppendLine("</ol>");
        hearingDetails.AppendLine("</div>");

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
            var accordingConferenceBridges = await UnitOfWork.ConferenceBridgeRepository.GetAccordingScheduleForCheck(systemUserId, scheduleData.Time);
            if (accordingConferenceBridges?.Count > 1)
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

        importLogging.AddLog("No duplicate hearings found, all hearings are new and unique");
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

    private void LogHearingVerbose(string message)
    {
        Log.Information("{Message}", message);
    }
}