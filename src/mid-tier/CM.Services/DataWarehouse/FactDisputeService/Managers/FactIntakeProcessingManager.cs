using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;
using CM.Services.DataWarehouse.DataWarehouseDataModel.Models;
using CM.Services.DataWarehouse.DataWarehouseRepository.UnitOfWork;
using CM.Services.DataWarehouse.FactDisputeService.Common;
using CM.Services.DataWarehouse.FactDisputeService.Helper;
using Serilog;

namespace CM.Services.DataWarehouse.FactDisputeService.Managers;

public class FactIntakeProcessingManager : StatisticManagerBase
{
    private const string NoStatuses = "No Statuses For Load";

    private readonly int[] _timeIoAssignedMinStatuses =
    {
        (int)DisputeStatuses.Received,
        (int)DisputeStatuses.AssessingApplication,
        (int)DisputeStatuses.ConfirmingInformation,
        (int)DisputeStatuses.ReadyForScheduling,
        (int)DisputeStatuses.DocumentReadyToSend,
        (int)DisputeStatuses.ScreeningDecisionRequired
    };

    public FactIntakeProcessingManager(IUnitOfWork unitOfWork, IUnitOfWorkDataWarehouse dwUnitOfWork, ILogger logger)
        : base(unitOfWork, dwUnitOfWork, logger)
    {
    }

    public async Task RecordAsync(DateTime? startDate, DateTime? endDate)
    {
        var loadingEventId = await LoadingHistoryManager.InsertLoadingHistory(FactTable.FIntakeProcessing);
        try
        {
            var error = await GetRecords(startDate, endDate);

            if (error == string.Empty)
            {
                LogInformation("Entities generated");

                var res = await DwUnitOfWork.Complete();

                if (res.CheckSuccess())
                {
                    LogInformation("Entity recorded");

                    await LoadingHistoryManager.UpdateLoadingHistory(loadingEventId, LoadingHistoryStatus.LoadComplete, string.Empty, res);
                }
                else
                {
                    LogInformation("Insert is failed");
                    await LoadingHistoryManager.UpdateLoadingHistory(loadingEventId, LoadingHistoryStatus.Failed, "Insert is failed", 0);
                }
            }
            else if (error == NoStatuses)
            {
                LogInformation("0 Entity recorded");

                await LoadingHistoryManager.UpdateLoadingHistory(loadingEventId, LoadingHistoryStatus.LoadComplete, NoStatuses, 0);
            }
            else
            {
                LogInformation("Insert is failed - " + error);
                await LoadingHistoryManager.UpdateLoadingHistory(loadingEventId, LoadingHistoryStatus.Failed, error, 0);
            }
        }
        catch (Exception e)
        {
            LogError("Error during record", e);
            await LoadingHistoryManager.UpdateLoadingHistory(loadingEventId, LoadingHistoryStatus.Failed, e.Message, 0);
        }
    }

    private async Task<string> GetRecords(DateTime? startDate, DateTime? endDate)
    {
        LogInformation("Start get records");
        try
        {
            var utcStart = startDate;
            var utcEnd = endDate;

            if (utcStart == null || utcEnd == null || endDate <= startDate)
            {
                (utcStart, utcEnd) = CommonFieldsLoader.GetUtcRange();
            }

            var disputeStatuses = await UnitOfWork.DisputeStatusRepository.GetProcessedStatuses(utcStart.Value, utcEnd.Value);

            if (disputeStatuses == null || disputeStatuses.Count < 1)
            {
                return NoStatuses;
            }

            var statusesIds = disputeStatuses.Select(x => x.DisputeStatusId).ToArray();
            var statuses1And6Duration = await UnitOfWork.DisputeStatusRepository.GetStatuses1And6Duration(statusesIds);
            var disputeGuids = disputeStatuses.Select(x => x.DisputeGuid).Distinct().ToList();
            var disputes = await UnitOfWork.DisputeRepository.GetDisputesByDisputeGuid(disputeGuids);
            LogInformation($"Disputes count = {disputes.Count}");

            var allStatusesByGuids = await UnitOfWork.DisputeStatusRepository.GetStatusesByGuids(disputeGuids);

            var groupedDisputeStatuses = disputeStatuses.GroupBy(x => x.DisputeGuid).ToList();
            LogInformation($"GroupedDisputeStatuses count = {groupedDisputeStatuses.Count}");

            foreach (var item in groupedDisputeStatuses)
            {
                var statuses = item.ToList();
                foreach (var status in statuses)
                {
                    var prevStatus = await GetPreviousStatus(status);
                    if (prevStatus != null && prevStatus.Stage == (byte?)DisputeStage.ApplicationScreening)
                    {
                        var earliestStatus = await GetEarliestSequentialStage2(status);

                        var existedRecord = await IsRecordExists(item.Key, status.DisputeStatusId, earliestStatus.DisputeStatusId);

                        if (!existedRecord)
                        {
                            var currentDisputeStatuses = allStatusesByGuids
                                .Where(x => x.DisputeGuid == earliestStatus.DisputeGuid)
                                .OrderBy(x => x.DisputeStatusId)
                                .ToList();

                            var unassignedStage2TimeMin = currentDisputeStatuses
                                .Where(x => x.DisputeStatusId >= earliestStatus.DisputeStatusId
                                            && x.DisputeStatusId < status.DisputeStatusId
                                            && x.Stage == (byte?)DisputeStage.ApplicationScreening
                                            && (x.Owner == null || x.Owner == 0))
                                .Sum(x => x.DurationSeconds);

                            var timeIoAssignedMin = currentDisputeStatuses
                                .Where(x => x.DisputeStatusId >= earliestStatus.DisputeStatusId
                                            && x.DisputeStatusId < status.DisputeStatusId
                                            && _timeIoAssignedMinStatuses.Contains(x.Status)
                                            && x.Owner != null && x.Owner != 0)
                                .Sum(x => x.DurationSeconds);

                            var timeTotalProcessingMin = currentDisputeStatuses
                                .Where(x => x.DisputeStatusId >= earliestStatus.DisputeStatusId
                                            && x.DisputeStatusId < status.DisputeStatusId)
                                .Sum(x => x.DurationSeconds);

                            var confirmingInfoStatusTimeMin = currentDisputeStatuses
                                .Where(x => x.DisputeStatusId >= earliestStatus.DisputeStatusId
                                            && x.DisputeStatusId < status.DisputeStatusId
                                            && x.Status == (byte)DisputeStatuses.ConfirmingInformation)
                                .Sum(x => x.DurationSeconds);

                            var processDecReqStatusTimeMin = currentDisputeStatuses
                                .Where(x => x.DisputeStatusId >= earliestStatus.DisputeStatusId
                                            && x.DisputeStatusId < status.DisputeStatusId
                                            && x.Status == (byte)DisputeStatuses.ProcessDecisionRequired)
                                .Sum(x => x.DurationSeconds);

                            var processDecReqStatusAssignedTimeMin = currentDisputeStatuses
                                .Where(x => x.DisputeStatusId >= earliestStatus.DisputeStatusId
                                            && x.DisputeStatusId < status.DisputeStatusId
                                            && x.Status == (byte)DisputeStatuses.ProcessDecisionRequired
                                            && x.Owner != null && x.Owner != 0)
                                .Sum(x => x.DurationSeconds);

                            var screenDecReqStatusTimeMin = currentDisputeStatuses
                                .Where(x => x.DisputeStatusId >= earliestStatus.DisputeStatusId
                                            && x.DisputeStatusId < status.DisputeStatusId
                                            && x.Status == (byte)DisputeStatuses.ScreeningDecisionRequired)
                                .Sum(x => x.DurationSeconds);

                            var screenDecReqStatusAssignedTimeMin = currentDisputeStatuses
                                .Where(x => x.DisputeStatusId >= earliestStatus.DisputeStatusId
                                            && x.DisputeStatusId < status.DisputeStatusId
                                            && x.Status == (byte)DisputeStatuses.ScreeningDecisionRequired
                                            && x.Owner != null && x.Owner != 0)
                                .Sum(x => x.DurationSeconds);

                            var firstAssignedDisputeStatus = currentDisputeStatuses
                                .OrderBy(x => x.DisputeStatusId)
                                .FirstOrDefault(x => x.DisputeStatusId >= earliestStatus.DisputeStatusId
                                                     && x.DisputeStatusId <= status.DisputeStatusId
                                                     && x.Owner != null && x.Owner != 0);
                            var firstAssignedDisputeStatusId = firstAssignedDisputeStatus?.DisputeStatusId;
                            var firstAssignedDateTime = firstAssignedDisputeStatus?.StatusStartDate;
                            var firstAssignedStatus = firstAssignedDisputeStatus?.Status;
                            var firstAssignedOwner = firstAssignedDisputeStatus?.Owner;

                            var lastAssignedDisputeStatus = currentDisputeStatuses.OrderByDescending(x => x.DisputeStatusId)
                                .FirstOrDefault(x => x.DisputeStatusId >= earliestStatus.DisputeStatusId
                                                     && x.DisputeStatusId <= status.DisputeStatusId
                                                     && x.Owner != null && x.Owner != 0);
                            var lastAssignedDisputeStatusId = lastAssignedDisputeStatus?.DisputeStatusId;
                            var lastAssignedDateTime = lastAssignedDisputeStatus?.StatusStartDate;
                            var lastAssignedStatus = lastAssignedDisputeStatus?.Status;
                            var lastAssignedOwner = lastAssignedDisputeStatus?.Owner;

                            var processingOwners = currentDisputeStatuses.Where(x => x.Owner != null && x.Owner != 0 && x.DisputeStatusId >= earliestStatus.DisputeStatusId
                                                                           && x.DisputeStatusId < status.DisputeStatusId)
                                .Select(x => x.Owner.ToString())
                                .Distinct()
                                .ToList();
                            var processingOwnersCount = processingOwners.Count();
                            var processingOwnersList = processingOwners.CreateString(",", true);

                            var intakeWasUpdated = statuses1And6Duration.Exists(x => x.DisputeGuid == item.Key);
                            var timeStatusNeedsUpdateMin = statuses1And6Duration.Where(x => x.DisputeGuid == item.Key).Sum(x => x.Duration);
                            var dispute = disputes.FirstOrDefault(x => x.DisputeGuid == item.Key);
                            var disputeHearings = await UnitOfWork.DisputeHearingRepository.GetDisputeHearingsWithParticipations(dispute.DisputeGuid);

                            LogInformation($"DisputeHearings count = {disputeHearings.Count}");

                            var primaryDisputeHearing = disputeHearings != null && disputeHearings.Count > 0
                                ? disputeHearings.FirstOrDefault(d => d.DisputeHearingRole == (byte)DisputeHearingRole.Active)
                                : null;
                            var linkedDisputes = primaryDisputeHearing != null
                                ? await UnitOfWork.DisputeHearingRepository.GetHearingDisputes(primaryDisputeHearing.HearingId)
                                : null;

                            var participants = await UnitOfWork
                                .ParticipantRepository
                                .GetDisputeActiveParticipantsAsync(dispute.DisputeGuid);
                            LogInformation($"Participants count = {participants.Count}");

                            var participantsId = participants.Select(x => x.ParticipantId).ToList();
                            var claimGroupParticipants = await UnitOfWork.ClaimGroupParticipantRepository
                                .FindAllAsync(x => participantsId.Contains(x.ParticipantId));
                            LogInformation($"ClaimGroupParticipants count = {claimGroupParticipants.Count}");

                            var applicants = claimGroupParticipants
                                .Where(x => x.GroupParticipantRole == (byte)GroupParticipantRole.Applicant)
                                .Select(x => x.ParticipantId).ToList();

                            var respondents = claimGroupParticipants
                                .Where(x => x.GroupParticipantRole == (byte)GroupParticipantRole.Respondent)
                                .Select(x => x.ParticipantId).ToList();

                            var hearingAllDisputes = disputeHearings.Select(x => x.DisputeGuid).ToList();
                            var issues = await CommonFieldsLoader.GetDisputesClaims(UnitOfWork, hearingAllDisputes);
                            var disputeAllStatuses = await UnitOfWork.DisputeStatusRepository.FindAllAsync(x => x.DisputeGuid == dispute.DisputeGuid);
                            var processes = CommonFieldsLoader.GetProcessesCount(UnitOfWork, disputeAllStatuses.ToList());
                            var uniqueStatuses = await CommonFieldsLoader.GetUniqueStatusesCount(UnitOfWork, dispute.DisputeGuid);
                            var evidenceFiles = await CommonFieldsLoader.GetLinkedEvidenceFiles(UnitOfWork, new List<Guid?> { dispute.DisputeGuid });
                            LogInformation($"EvidenceFiles count = {evidenceFiles.Count}");
                            var fileIds = evidenceFiles.Select(x => x.FileId);
                            var associatedFiles = await UnitOfWork.FileRepository.FindAllAsync(x => fileIds.Contains(x.FileId));
                            LogInformation($"AssociatedFiles count = {associatedFiles.Count}");
                            var fileSizesSum = CommonFieldsLoader.GetLinkedEvidenceFilesMb(UnitOfWork, evidenceFiles, associatedFiles);
                            var subServices = await UnitOfWork.SubstitutedServiceRepository.FindAllAsync(x => x.DisputeGuid == dispute.DisputeGuid);

                            var lastNotice = await UnitOfWork.NoticeRepository.GetLastNotice(dispute.DisputeGuid, new NoticeTypes[] { NoticeTypes.GeneratedDisputeNotice });
                            var hasArsDeadline = lastNotice != null ? lastNotice.HasServiceDeadline : false;

                            LogInformation("All fields are get for status");

                            var factIntakeProcessing = new FactIntakeProcessing
                            {
                                LoadDateTime = DateTime.UtcNow,
                                AssociatedOffice = (int)Offices.Rtbbc,
                                IsActive = true,
                                IsPublic = true,
                                DisputeGuid = item.Key,
                                ProcessStartDisputeStatusId = earliestStatus.DisputeStatusId,
                                ProcessStartDateTime = earliestStatus.StatusStartDate,
                                ProcessStartProcess = earliestStatus.Process,
                                ProcessEndDisputeStatusId = status.DisputeStatusId,
                                ProcessEndDateTime = status.StatusStartDate,
                                ProcessEndStage = status.Stage,
                                ProcessEndStatus = status.Status,
                                ProcessEndProcess = status.Process,
                                UnassignedStage2TimeMin = unassignedStage2TimeMin / 60 ?? 0,
                                TimeIoAssignedMin = timeIoAssignedMin / 60 ?? 0,
                                TimeTotalProcessingMin = timeTotalProcessingMin / 60 ?? 0,
                                ConfirmingInfoStatusTimeMin = confirmingInfoStatusTimeMin / 60 ?? 0,
                                ProcessDecReqStatusTimeMin = processDecReqStatusTimeMin / 60 ?? 0,
                                ProcessDecReqStatusAssignedTimeMin = processDecReqStatusAssignedTimeMin / 60 ?? 0,
                                ScreenDecReqStatusTimeMin = screenDecReqStatusTimeMin / 60 ?? 0,
                                ScreenDecReqStatusAssignedTimeMin = screenDecReqStatusAssignedTimeMin / 60 ?? 0,
                                FirstAssignedDisputeStatusId = firstAssignedDisputeStatusId,
                                FirstAssignedDateTime = firstAssignedDateTime,
                                FirstAssignedStatus = firstAssignedStatus,
                                FirstAssignedOwner = firstAssignedOwner,
                                LastAssignedDisputeStatusId = lastAssignedDisputeStatusId,
                                LastAssignedDateTime = lastAssignedDateTime,
                                LastAssignedStatus = lastAssignedStatus,
                                LastAssignedOwner = lastAssignedOwner,
                                ProcessingOwners = processingOwnersCount,
                                ProcessingOwnersList = processingOwnersList,
                                IntakeWasUpdated = intakeWasUpdated,
                                TimeStatusNeedsUpdateMin = timeStatusNeedsUpdateMin / 60 ?? 0,
                                DisputeType = dispute.DisputeType,
                                DisputeSubType = dispute.DisputeSubType,
                                TenancyUnitType = (int?)dispute.TenancyUnitType,
                                DisputeUrgency = dispute.DisputeUrgency,
                                CreationMethod = dispute.CreationMethod,
                                TenancyEnded = dispute.TenancyEnded.HasValue ? (dispute.TenancyEnded == 1) : null,
                                TenancyEndDateTime = dispute.TenancyEndDate,
                                SubmittedDateTime = dispute.SubmittedDate,
                                InitialPaymentMethod = dispute.InitialPaymentMethod,
                                InitialPaymentDateTime = dispute.InitialPaymentDate,
                                SharedHearingLinkingType = primaryDisputeHearing?.SharedHearingLinkType ?? null,
                                DisputeHearingRole = primaryDisputeHearing?.DisputeHearingRole ?? null,
                                LinkedDisputes = linkedDisputes?.Count ?? 0,
                                HearingStartDateTime = primaryDisputeHearing?.Hearing?.HearingStartDateTime ?? null,
                                Participants = participants.Count,
                                Applicants = applicants.Count,
                                Respondents = respondents.Count,
                                Issues = issues.Count,
                                Processes = processes,
                                Statuses = uniqueStatuses,
                                EvidenceFiles = evidenceFiles.Count,
                                EvidenceFilesMb = (int?)fileSizesSum,
                                SubServiceRequests = subServices.Count,
                                ProcessStartStage = earliestStatus.Stage,
                                ProcessStartStatus = earliestStatus.Status,
                                HasArsDeadline = hasArsDeadline,
                                DisputeComplexity = (int?)dispute.DisputeComplexity
                            };

                            await DwUnitOfWork.FactIntakeProcessingRepository.InsertAsync(factIntakeProcessing);

                            LogInformation("Record inserted into context for save.");
                        }
                    }
                }
            }

            return string.Empty;
        }
        catch (Exception e)
        {
            LogError(e.Message, e);
            return e.Message;
        }
    }

    private async Task<bool> IsRecordExists(Guid disputeGuid, int statusId, int earliestStatusId)
    {
        var exists = await DwUnitOfWork
            .FactIntakeProcessingRepository
            .GetExistedRecord(disputeGuid, statusId, earliestStatusId);
        return exists;
    }

    private async Task<Data.Model.DisputeStatus> GetEarliestSequentialStage2(Data.Model.DisputeStatus status)
    {
        var statuses = await UnitOfWork.DisputeStatusRepository.GetDisputeStatuses(status.DisputeGuid);
        var index = statuses.IndexOf(status);
        var prevStatus = status;

        do
        {
            index--;
            prevStatus = statuses.ElementAt(index);
        }
        while (prevStatus.Stage == (byte?)DisputeStage.ApplicationScreening);

        var processingStatus = statuses.ElementAt(index + 1);

        return processingStatus;
    }

    private async Task<Data.Model.DisputeStatus> GetPreviousStatus(Data.Model.DisputeStatus status)
    {
        var statuses = await UnitOfWork.DisputeStatusRepository.GetDisputeStatuses(status.DisputeGuid);
        var index = statuses.IndexOf(status);

        if (index == 0)
        {
            return null;
        }

        var prevStatus = statuses.ElementAt(index - 1);
        return prevStatus;
    }
}