using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;
using CM.Services.DataWarehouse.DataWarehouseDataModel.Models;
using CM.Services.DataWarehouse.DataWarehouseRepository.UnitOfWork;
using CM.Services.DataWarehouse.FactDisputeService.Common;
using CM.Services.DataWarehouse.FactDisputeService.Helper;
using Serilog;
using TaskStatus = CM.Common.Utilities.TaskStatus;

namespace CM.Services.DataWarehouse.FactDisputeService.Managers;

public class FactTimeStatisticManager : StatisticManagerBase
{
    private readonly int[] _oldStatuses =
    {
        (int)DisputeStatuses.DecisionPending,
        (int)DisputeStatuses.InterimDecisionPending,
        (int)DisputeStatuses.ClarificationDecisionPending,
        (int)DisputeStatuses.CorrectionDecisionPending
    };

    private readonly int[] _stageOpenArray =
    {
        (int)DisputeStatuses.Withdrawn,
        (int)DisputeStatuses.CancelledByRtb,
        (int)DisputeStatuses.AbandonedNoPayment,
        (int)DisputeStatuses.Dismissed,
        (int)DisputeStatuses.AbandonedApplicantInaction
    };

    public FactTimeStatisticManager(IUnitOfWork unitOfWork, IUnitOfWorkDataWarehouse dwUnitOfWork, ILogger logger)
        : base(unitOfWork, dwUnitOfWork, logger)
    {
    }

    public async Task Record()
    {
        var loadingEventId = await LoadingHistoryManager.InsertLoadingHistory(FactTable.FTimeStatistics);
        FactTimeStatistic factTimeStatistics = null;
        try
        {
            factTimeStatistics = await GetRecord();

            LogInformation("Entity generated");

            await DwUnitOfWork.FactTimeStatisticRepository.InsertAsync(factTimeStatistics);
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
        catch (Exception e)
        {
            if (factTimeStatistics != null)
            {
                var jsonString = JsonSerializer.Serialize(factTimeStatistics);
                LogInformation($"factTimeStatistics Dump = {jsonString}");
            }

            LogError("Error during record", e);
            await LoadingHistoryManager.UpdateLoadingHistory(loadingEventId, LoadingHistoryStatus.Failed, e.Message, 0);
        }
    }

    private async Task<FactTimeStatistic> GetRecord()
    {
        var(utcStart, utcEnd) = CommonFieldsLoader.GetUtcRange();

        var associatedId = await DwUnitOfWork.DimTimeRepository.GetIdByDate(utcStart);

        var openFilesCount = await UnitOfWork.DisputeRepository.GetOpenDisputesCount();

        var disputeFees = await UnitOfWork.DisputeFeeRepository.GetDisputeFeesByPaidDate(utcStart, utcEnd);

        var disputesIpd = await UnitOfWork.DisputeRepository.GetDisputeByInitialPaymentDate(utcStart, utcEnd);

        var disputeHearings = await UnitOfWork.DisputeHearingRepository.GetDisputeHearingsByHearingStartDate(utcStart, utcEnd);

        var disputeHearingsEmergency = disputeHearings.Where(x => x.HearingPriority == (byte)HearingPriority.Emergency);
        var disputeHearingsStandard = disputeHearings.Where(x => x.HearingPriority == (byte)HearingPriority.Standard);
        var disputeHearingsDeferred = disputeHearings.Where(x => x.HearingPriority == (byte)HearingPriority.Deferred);
        var disputeHearingsDuty = disputeHearings.Where(x => x.HearingPriority == (byte)HearingPriority.Duty);

        var emptyHearings = await UnitOfWork.HearingRepository
                            .GetHearingsByHearingStartDate(utcStart, utcEnd, disputeHearings.Select(x => x.HearingId).ToList());

        var emptyHearingsEmergency = emptyHearings.Where(x => x.HearingPriority == (byte)HearingPriority.Emergency);
        var emptyHearingsStandard = emptyHearings.Where(x => x.HearingPriority == (byte)HearingPriority.Standard);
        var emptyHearingsDeferred = emptyHearings.Where(x => x.HearingPriority == (byte)HearingPriority.Deferred);
        var emptyHearingsDuty = emptyHearings.Where(x => x.HearingPriority == (byte)HearingPriority.Duty);

        var avgNextDisputeHearings = await UnitOfWork.DisputeHearingRepository.FindAllAsync(x => x.IsDeleted != true);
        var avgNextDisputeHearingsId = avgNextDisputeHearings.Select(x => x.HearingId).ToList();

        var files = await UnitOfWork.FileRepository.GetFilesByCreatedDate(utcStart, utcEnd);
        LogInformation($"File Count - {files?.Count}");

        var evidenceFiles =
            await UnitOfWork.FileRepository.GetEvidenceFilesByCreatedDate(utcStart, utcEnd, files);
        LogInformation($"Evidence File Count - {evidenceFiles?.Count}");

        var disputeStatuses =
            await UnitOfWork.DisputeStatusRepository.GetStatusesByStatusStartDate(utcStart, utcEnd);

        var disputeStatusesAll =
            await UnitOfWork.DisputeStatusRepository.GetAllStatusesByStatusStartDate(utcStart, utcEnd);

        var statusWaitingProofServices =
            disputeStatuses
            .Where(x => x.Status == (byte)DisputeStatuses.WaitingForProofOfService
                        && x.Process == (byte?)DisputeProcess.NonParticipatoryHearing);

        var statusAbandonedNeedsUpdates = disputeStatuses.Where(x =>
            x.Status == (byte)DisputeStatuses.AbandonedApplicantInaction &&
            x.Stage == (byte)DisputeStage.ApplicationInProgress);

        var statusAbandonedNoService = disputeStatuses.Where(x =>
            x.Status == (byte)DisputeStatuses.AbandonedApplicantInaction &&
            x.Stage == (byte)DisputeStage.ServingDocuments);

        var statusCancelled = disputeStatuses.Where(x => x.Status == (byte)DisputeStatuses.CancelledByRtb);

        var statusNeedsUpdate = disputeStatuses.Where(x =>
            x.Status == (byte)DisputeStatuses.PaymentRequired ||
            x.Status == (byte)DisputeStatuses.PaperApplicationUpdateRequired);

        var statusWithdrawn = disputeStatuses.Where(x => x.Status == (byte)DisputeStatuses.Withdrawn);

        var statusWaitingForDecisionsCount = await UnitOfWork.DisputeStatusRepository.GetWaitingForDecisionsCount();

        var statusesForOldest = await UnitOfWork.DisputeStatusRepository.GetOldestStatus(_oldStatuses);

        var statusWaitingForDecisionOldest = statusesForOldest?.StatusStartDate ?? default;

        var outcomeDocRequests =
            await UnitOfWork.OutcomeDocRequestRepository.GetRequestsByCreatedDate(utcStart, utcEnd);

        var correctionRequests =
            outcomeDocRequests.Where(x => x.RequestType == OutcomeDocRequestType.Correction);

        var clarificationRequests =
            outcomeDocRequests.Where(x => x.RequestType == OutcomeDocRequestType.Clarification);

        var reviewRequests =
            outcomeDocRequests.Where(x => x.RequestType == OutcomeDocRequestType.ReviewRequest);

        var statusClosed = disputeStatuses.Where(x => x.Status == (byte)DisputeStatuses.Closed);

        var stageOpenDisputeStatuses = await UnitOfWork
            .DisputeStatusRepository
            .GetStageOpenDisputeStatuses(new int?[]
                {
                    (byte)DisputeStage.ApplicationInProgress,
                    (byte)DisputeStage.ApplicationScreening,
                    (byte)DisputeStage.ServingDocuments,
                    (byte)DisputeStage.HearingPending,
                    (byte)DisputeStage.Hearing,
                    (byte)DisputeStage.DecisionAndPostSupport
                },
                _stageOpenArray);

        var stage0Open = stageOpenDisputeStatuses.Where(x =>
            x.Stage == (byte)DisputeStage.ApplicationInProgress && !_stageOpenArray.Contains(x.Status));

        var stage2Open = stageOpenDisputeStatuses.Where(x =>
            x.Stage == (byte)DisputeStage.ApplicationScreening && !_stageOpenArray.Contains(x.Status));

        var stage4Open = stageOpenDisputeStatuses.Where(x =>
            x.Stage == (byte)DisputeStage.ServingDocuments && !_stageOpenArray.Contains(x.Status));

        var stage6Open = stageOpenDisputeStatuses.Where(x =>
            x.Stage == (byte)DisputeStage.HearingPending && !_stageOpenArray.Contains(x.Status));

        var stage8Open = stageOpenDisputeStatuses.Where(x =>
            x.Stage == (byte)DisputeStage.Hearing && !_stageOpenArray.Contains(x.Status));

        var stage10Open = stageOpenDisputeStatuses.Where(x =>
            x.Stage == (byte)DisputeStage.DecisionAndPostSupport && !_stageOpenArray.Contains(x.Status) && x.Status != (int)DisputeStatuses.Closed);

        var stage2Unassigned = stageOpenDisputeStatuses.Where(x =>
                x.Stage == (byte)DisputeStage.ApplicationScreening && !_stageOpenArray.Contains(x.Status) &&
                (x.Owner == null || x.Owner == 0))
            .OrderBy(x => x.StatusStartDate)
            .ToList();

        var stage2UnassignedOldest = stage2Unassigned.FirstOrDefault()?.StatusStartDate;

        var stage2Assigned = stageOpenDisputeStatuses.Where(x =>
                x.Stage == (byte)DisputeStage.ApplicationScreening && !_stageOpenArray.Contains(x.Status) &&
                x.Owner != null && x.Owner != 0)
            .OrderBy(x => x.StatusStartDate)
            .ToList();

        var stage2AssignedOldest = stage2Assigned.FirstOrDefault()?.StatusStartDate;

        var rescheduledStatuses = await UnitOfWork
            .DisputeStatusRepository
            .FindAllAsync(x => x.IsActive && x.Status == (byte)DisputeStatuses.ToBeRescheduled);

        var statusRescheduledUnassigned = rescheduledStatuses.Where(x =>
            x.Status == (byte)DisputeStatuses.ToBeRescheduled && (x.Owner == null || x.Owner == 0));

        var statusRescheduledAssigned = rescheduledStatuses.Where(x =>
            x.Status == (byte)DisputeStatuses.ToBeRescheduled && x.Owner != null && x.Owner != 0);

        var tasks = await UnitOfWork.TaskRepository.GetAllAsync();

        var subServicesSubmitted = await UnitOfWork.SubstitutedServiceRepository.GetSubmittedSubServices(utcStart, utcEnd);

        var amendmentsSubmitted = tasks.Where(x =>
            x.TaskActivityType == 20 && x.CreatedDate >= utcStart && x.CreatedDate <= utcEnd).ToList();

        var iOIncompleteTasksUnassigned =
            tasks
                .Where(x => x.TaskSubType == (byte)TaskSubType.InformationOfficer && x.TaskStatus != (byte)TaskStatus.Complete && x.TaskOwnerId == null)
                .OrderBy(x => x.CreatedDate)
                .ToList();

        var iOIncompleteTasksUnassignedOldest = iOIncompleteTasksUnassigned.FirstOrDefault()?.CreatedDate;

        var iOIncompleteTasksAssigned =
            tasks.Where(x => x.TaskSubType == (byte)TaskSubType.InformationOfficer && x.TaskStatus != (byte)TaskStatus.Complete && x.TaskOwnerId != null).ToList();

        var iOTasksCompleted = tasks
            .Where(x => x.TaskSubType == (byte)TaskSubType.InformationOfficer && x.TaskStatus == (byte)TaskStatus.Complete &&
                        x.DateTaskCompleted >= utcStart && x.DateTaskCompleted <= utcEnd).ToList();

        var arbIncompleteTasksAssigned =
            tasks.Where(x => x.TaskSubType == (byte)TaskSubType.Arbitrator && x.TaskStatus != (byte)TaskStatus.Complete && x.TaskOwnerId != null).ToList();

        var arbIncompleteTasksUnassigned =
            tasks.Where(x => x.TaskSubType == (byte)TaskSubType.Arbitrator && x.TaskStatus != (byte)TaskStatus.Complete && x.TaskOwnerId == null)
                .OrderBy(x => x.CreatedDate)
                .ToList();

        var arbIncompleteTasksUnassignedOldest = arbIncompleteTasksUnassigned.FirstOrDefault()?.CreatedDate;

        var arbTasksCompleted = tasks.Where(x =>
            x.TaskSubType == (byte)TaskSubType.Arbitrator &&
            x.TaskStatus == (byte)TaskStatus.Complete &&
            x.DateTaskCompleted >= utcStart &&
            x.DateTaskCompleted <= utcEnd);

        var otherIncompleteTasks =
            tasks.Where(x => x.TaskSubType != (byte)TaskSubType.InformationOfficer &&
                             x.TaskSubType != (byte)TaskSubType.Arbitrator &&
                             x.TaskSubType.HasValue &&
                             x.TaskStatus != (byte)TaskStatus.Complete);

        var outcomeDocDeliveries = await UnitOfWork.OutcomeDocDeliveryRepository.GetAllAsync();

        var documentsUndelivered = outcomeDocDeliveries
            .Where(x => x.ReadyForDelivery == true && x.IsDelivered.HasValue && x.IsDelivered != true)
            .OrderBy(x => x.ReadyForDeliveryDate)
            .DistinctBy(x => x.OutcomeDocFileId).ToList();

        var documentsUndeliveredOldest = documentsUndelivered
            .FirstOrDefault(x => x.ReadyForDeliveryDate.HasValue)?.ReadyForDeliveryDate;

        var documentsUndeliveredUrgent = outcomeDocDeliveries.Where(x =>
                x.ReadyForDelivery == true && x.IsDelivered.HasValue && x.IsDelivered != true && x.DeliveryPriority == (int)DeliveryPriority.Failed)
            .DistinctBy(x => x.OutcomeDocFileId)
            .OrderBy(x => x.ReadyForDeliveryDate)
            .ToList();

        var documentsUndeliveredUrgentOldest = documentsUndeliveredUrgent
            .FirstOrDefault(x => x.ReadyForDeliveryDate.HasValue)?.ReadyForDeliveryDate;

        var documentsDelivered = outcomeDocDeliveries
            .Where(x => x.IsDelivered == true && x.DeliveryDate >= utcStart && x.DeliveryDate <= utcEnd)
            .DistinctBy(x => x.OutcomeDocFileId);

        var filesMb = files is { Count: > 0 } ? files.Sum(x => x.FileSize) : 0;

        var evidenceFilesMb = evidenceFiles is { Count: > 0 } ? evidenceFiles.Sum(x => x.FileSize) : 0;

        var intakeProcessedCount = await UnitOfWork.DisputeStatusRepository.GetDisputesCountLastChangesStatusFrom2(utcStart, utcEnd);

        var stage2UnassignedUrgent = await UnitOfWork.DisputeRepository.GetStage2Unassigned(1);
        var stage2UnassignedStandard = await UnitOfWork.DisputeRepository.GetStage2Unassigned(2);
        var stage2UnassignedDeferred = await UnitOfWork.DisputeRepository.GetStage2Unassigned(3);

        var waitTimeDaysDeferred = await UnitOfWork.HearingRepository.GetWaitTimeDays(3, 23, stage2UnassignedDeferred);
        var waitTimeDaysStandard = await UnitOfWork.HearingRepository.GetWaitTimeDays(2, 23, stage2UnassignedStandard);
        var waitTimeDaysUrgent = await UnitOfWork.HearingRepository.GetWaitTimeDays(1, 10, stage2UnassignedUrgent);

        var nonParticipatoryStatuses = await UnitOfWork
            .DisputeStatusRepository
            .FindAllAsync(x => x.IsActive &&
                  (x.Status == (byte)DisputeStatuses.ClosedForSubmissions
                || x.Status == (byte)DisputeStatuses.Adjourned
                || x.Status == (byte)DisputeStatuses.Closed));

        var nonParticipatoryWaitingDecision = nonParticipatoryStatuses
                                    .Count(x => x.Status == (byte)DisputeStatuses.ClosedForSubmissions
                                    && x.Process == (byte?)DisputeProcess.NonParticipatoryHearing);

        var nonParticipatoryWaitingDecisionOldest = nonParticipatoryStatuses
                                    .Where(x => x.Status == (byte)DisputeStatuses.ClosedForSubmissions
                                    && x.Process == (byte?)DisputeProcess.NonParticipatoryHearing)
                                    .OrderBy(x => x.StatusStartDate)
                                    .FirstOrDefault()
                                    .StatusStartDate;

        var nonParticipatoryClosed = nonParticipatoryStatuses
                                    .Count(x => x.Status == (byte)DisputeStatuses.Closed
                                    && x.Process == (byte?)DisputeProcess.NonParticipatoryHearing
                                    && x.StatusStartDate >= utcStart
                                    && x.StatusStartDate <= utcEnd);

        var statusAdjourned = nonParticipatoryStatuses
                                    .Count(x => x.Status == (byte)DisputeStatuses.Adjourned
                                    && x.StatusStartDate >= utcStart
                                    && x.StatusStartDate <= utcEnd);

        var participatoryWaitArsDeadline = await UnitOfWork
            .DisputeStatusRepository
            .GetStatusesCount(x => x.IsActive == true
                            && (x.Status == (byte)DisputeStatuses.WaitingForProofOfService
                            || x.Status == (byte)DisputeStatuses.OfficePaymentRequired)
                        && x.Process == (byte?)DisputeProcess.ParticipatoryHearing);

        var deadlineDisputeGuids = disputeStatusesAll
            .Where(x => x.Status == (byte)DisputeStatuses.WaitingForProofOfService
                            && x.Stage == (byte)DisputeStage.ServingDocuments
                        && x.Process == (byte?)DisputeProcess.ParticipatoryHearing)
            .Select(x => x.DisputeGuid)
            .Distinct()
            .ToList();

        var participatoryMissArsDeadline = await UnitOfWork
            .DisputeStatusRepository
            .GetStatusesCount(x => x.Status == (byte)DisputeStatuses.Dismissed
                            && x.Stage == (byte)DisputeStage.ServingDocuments
                        && x.Process == (byte?)DisputeProcess.ParticipatoryHearing
                        && deadlineDisputeGuids.Contains(x.DisputeGuid) && x.IsActive == true);

        var participatoryWaitReinstateDeadline = await UnitOfWork
            .DisputeStatusRepository
            .GetStatusesCount(x => x.IsActive == true
                            && x.Status == (byte)DisputeStatuses.Dismissed
                            && x.Stage == (byte)DisputeStage.ServingDocuments
                        && x.Process == (byte?)DisputeProcess.ParticipatoryHearing);

        var reinstateDeadlineDisputeGuids = disputeStatusesAll
            .Where(x => x.Status == (byte)DisputeStatuses.Dismissed
                            && x.Stage == (byte)DisputeStage.ServingDocuments
                        && x.Process == (byte?)DisputeProcess.ParticipatoryHearing)
            .Select(x => x.DisputeGuid)
            .Distinct()
            .ToList();

        var participatoryMissReinstateDeadline = await UnitOfWork
            .DisputeStatusRepository
            .GetStatusesCount(x => x.Status == (byte)DisputeStatuses.Withdrawn
                            && x.Stage == (byte)DisputeStage.ServingDocuments
                        && x.Process == (byte?)DisputeProcess.ParticipatoryHearing
                        && reinstateDeadlineDisputeGuids.Contains(x.DisputeGuid) && x.IsActive == true);

        LogInformation("Entity created");

        var factTimeStatistics = new FactTimeStatistic
        {
            LoadDateTime = DateTime.UtcNow,
            AssociatedOffice = (int)Offices.Rtbbc,
            IsActive = true,
            IsPublic = true,
            StatisticsType = 1,
            AssociatedDate = utcStart.Date,
            AssociatedDateId = associatedId,
            OpenFiles = openFilesCount,
            IntakePayments = disputeFees.Count(x => x.FeeType == (byte)DisputeFeeType.Intake),
            ReviewPayments = disputeFees.Count(x => x.FeeType == (byte)DisputeFeeType.ReviewRequest),
            PerUnitPayments = disputeFees.Count(x => x.FeeType == (byte)DisputeFeeType.LandlordIntake),

            OnlineDisputesPaid = disputesIpd.Count(x => x.CreationMethod is
                (byte)DisputeCreationMethod.Online or
                (byte)DisputeCreationMethod.OnlineRentIncrease or
                (byte)DisputeCreationMethod.PossessionForRenovation),

            OfficeDisputesPaid = disputesIpd.Count(x => x.CreationMethod is
                (byte)DisputeCreationMethod.Manual or
                (byte)DisputeCreationMethod.PaperRentIncrease),

            Process1DisputesPaid = disputesIpd
                .Count(x =>
                    x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId)
                        .FirstOrDefault()?
                        .Process == (byte)DisputeProcess.ParticipatoryHearing),

            Process2DisputesPaid = disputesIpd
                .Count(x => x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId)
                    .FirstOrDefault()?
                    .Process == (byte)DisputeProcess.NonParticipatoryHearing),

            Process7DisputesPaid = disputesIpd
                .Count(x => x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId)
                    .FirstOrDefault()?
                    .Process == (byte)DisputeProcess.RentIncrease),

        TenantDisputesPaid = disputesIpd.Count(x => x.DisputeSubType == (byte)DisputeSubType.ApplicantIsTenant),
            LandlordDisputesPaid = disputesIpd.Count(x => x.DisputeSubType == (byte)DisputeSubType.ApplicantIsLandlord),
            EmergencyDisputesPaid = disputesIpd.Count(x => x.DisputeUrgency == (byte)DisputeUrgency.Emergency),
            StandardDisputesPaid = disputesIpd.Count(x => x.DisputeUrgency == (byte)DisputeUrgency.Regular),
            DeferredDisputesPaid = disputesIpd.Count(x => x.DisputeUrgency == (byte)DisputeUrgency.Deferred),
            NoUrgencyDisputesPaid = disputesIpd.Count(x => x.DisputeUrgency == null),
            SubServicesSubmitted = subServicesSubmitted.Count,
            AmendmentsSubmitted = amendmentsSubmitted.Count,
            DisputeHearings = disputeHearings.Count,
            DisputeHearingsEmergency = disputeHearingsEmergency.Count(),
            DisputeHearingsStandard = disputeHearingsStandard.Count(),
            DisputeHearingsDeferred = disputeHearingsDeferred.Count(),
            DisputeHearingsDuty = disputeHearingsDuty.Count(),
            EmptyHearings = emptyHearings.Count,
            EmptyHearingsEmergency = emptyHearingsEmergency.Count(),
            EmptyHearingsStandard = emptyHearingsStandard.Count(),
            EmptyHearingsDeferred = emptyHearingsDeferred.Count(),
            EmptyHearingsDuty = emptyHearingsDuty.Count(),
            AvgNext10EmergEmptyHearingDays = 0,
            AvgNext10StandardEmptyHearingDays = 0,
            AvgNext10DeferredEmptyHearingDays = 0,
            Files = files?.Count ?? 0,
            FilesMb = FileUtils.ConvertBytesToMegabytes(filesMb),
            EvidenceFiles = evidenceFiles?.Count ?? 0,
            EvidenceFilesMb = FileUtils.ConvertBytesToMegabytes(evidenceFilesMb),
            StatusWaitingProofService = statusWaitingProofServices.Count(),
            StatusAbandonedNeedsUpdate = statusAbandonedNeedsUpdates.Count(),
            StatusAbandonedNoService = statusAbandonedNoService.Count(),
            StatusCancelled = statusCancelled.Count(),
            StatusNeedsUpdate = statusNeedsUpdate.Count(),
            StatusWithdrawn = statusWithdrawn.Count(),
            StatusWaitingForDecision = statusWaitingForDecisionsCount,
            StatusWaitingForDecisionOldest = statusWaitingForDecisionOldest,
            CorrectionRequests = correctionRequests.Count(),
            ClarificationRequests = clarificationRequests.Count(),
            ReviewRequests = reviewRequests.Count(),
            StatusClosed = statusClosed.Count(),
            Stage0Open = stage0Open.Count(),
            Stage2Open = stage2Open.Count(),
            Stage4Open = stage4Open.Count(),
            Stage6Open = stage6Open.Count(),
            Stage8Open = stage8Open.Count(),
            Stage10Open = stage10Open.Count(),
            Stage2Unassigned = stage2Unassigned.Count,
            Stage2UnassignedOldest = stage2UnassignedOldest.GetValueOrDefault(),
            Stage2Assigned = stage2Assigned.Count,
            Stage2AssignedOldest = stage2AssignedOldest.GetValueOrDefault(),
            StatusRescheduledUnassigned = statusRescheduledUnassigned.Count(),
            StatusRescheduledAssigned = statusRescheduledAssigned.Count(),
            IoIncompleteTasksUnassigned = iOIncompleteTasksUnassigned.Count,
            IoIncompleteTasksUnassignedOldest = iOIncompleteTasksUnassignedOldest.GetValueOrDefault(),
            IoIncompleteTasksAssigned = iOIncompleteTasksAssigned.Count,
            IoTasksCompleted = iOTasksCompleted.Count,
            ArbIncompleteTasksAssigned = arbIncompleteTasksAssigned.Count,
            ArbIncompleteTasksUnassigned = arbIncompleteTasksUnassigned.Count,
            ArbIncompleteTasksUnassignedOldest = arbIncompleteTasksUnassignedOldest.GetValueOrDefault(),
            ArbTasksCompleted = arbTasksCompleted.Count(),
            OtherIncompleteTasks = otherIncompleteTasks.Count(),
            DocumentsUndelivered = documentsUndelivered.Count,
            DocumentsUndeliveredOldest = documentsUndeliveredOldest.GetValueOrDefault(),
            DocumentsUndeliveredUrgent = documentsUndeliveredUrgent.Count,
            DocumentsUndeliveredUrgentOldest = documentsUndeliveredUrgentOldest.GetValueOrDefault(),
            DocumentsDelivered = documentsDelivered.Count(),
            IntakeProcessed = intakeProcessedCount,
            Stage2UnassignedUrgent = stage2UnassignedUrgent,
            Stage2UnassignedStandard = stage2UnassignedStandard,
            Stage2UnassignedDeferred = stage2UnassignedDeferred,
            WaitTimeDaysDeferred = waitTimeDaysDeferred,
            WaitTimeDaysStandard = waitTimeDaysStandard,
            WaitTimeDaysUrgent = waitTimeDaysUrgent,
            NonParticipatoryWaitingDecision = nonParticipatoryWaitingDecision,
            NonParticipatoryWaitingDecisionOldest = nonParticipatoryWaitingDecisionOldest,
            NonParticipatoryClosed = nonParticipatoryClosed,
            StatusAdjourned = statusAdjourned,
            ParticipatoryWaitArsDeadline = participatoryWaitArsDeadline,
            ParticipatoryMissArsDeadline = participatoryMissArsDeadline,
            ParticipatoryWaitReinstateDeadline = participatoryWaitReinstateDeadline,
            ParticipatoryMissReinstateDeadline = participatoryMissReinstateDeadline
        };

        return factTimeStatistics;
    }
}