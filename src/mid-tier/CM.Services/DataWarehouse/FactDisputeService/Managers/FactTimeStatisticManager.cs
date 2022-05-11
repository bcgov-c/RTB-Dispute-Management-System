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

        var emptyHearings = await UnitOfWork.HearingRepository.GetHearingsByHearingStartDate(utcStart, utcEnd, disputeHearings);

        var avgNextDisputeHearings = await UnitOfWork.DisputeHearingRepository.FindAllAsync(x => x.IsDeleted != true);
        var avgNextDisputeHearingsId = avgNextDisputeHearings.Select(x => x.HearingId).ToList();

        var avgNext10EmergHearingDays = await UnitOfWork.HearingRepository.GetAvgNext10HearingDays(12, 1, avgNextDisputeHearingsId);
        var avgNext10StandardHearingDays = await UnitOfWork.HearingRepository.GetAvgNext10HearingDays(23, 2, avgNextDisputeHearingsId);
        var avgNext10DeferredHearingDays = await UnitOfWork.HearingRepository.GetAvgNext10HearingDays(21, 3, avgNextDisputeHearingsId);

        var files = await UnitOfWork.FileRepository.GetFilesByCreatedDate(utcStart, utcEnd);
        LogInformation($"File Count - {files?.Count}");

        var evidenceFiles =
            await UnitOfWork.FileRepository.GetEvidenceFilesByCreatedDate(utcStart, utcEnd, files);
        LogInformation($"Evidence File Count - {evidenceFiles?.Count}");

        var disputeStatuses =
            await UnitOfWork.DisputeStatusRepository.GetStatusesByStatusStartDate(utcStart, utcEnd);

        var statusWaitingProofServices =
            disputeStatuses.Where(x => x.Status == (byte)DisputeStatuses.WaitingForProofOfService);

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

        var statusWaitingForDecision = disputeStatuses
            .Where(x => x.Status is
                (byte)DisputeStatuses.DecisionPending or
                (byte)DisputeStatuses.InterimDecisionPending or
                (byte)DisputeStatuses.ClarificationDecisionPending or
                (byte)DisputeStatuses.CorrectionDecisionPending)
            .ToList();

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

            TenantDisputesPaid = disputesIpd.Count(x => x.DisputeSubType == (byte)DisputeSubType.ApplicantIsTenant),
            LandlordDisputesPaid = disputesIpd.Count(x => x.DisputeSubType == (byte)DisputeSubType.ApplicantIsLandlord),
            EmergencyDisputesPaid = disputesIpd.Count(x => x.DisputeUrgency == (byte)DisputeUrgency.Emergency),
            StandardDisputesPaid = disputesIpd.Count(x => x.DisputeUrgency == (byte)DisputeUrgency.Regular),
            DeferredDisputesPaid = disputesIpd.Count(x => x.DisputeUrgency == (byte)DisputeUrgency.Deferred),
            SubServicesSubmitted = subServicesSubmitted.Count,
            AmendmentsSubmitted = amendmentsSubmitted.Count,
            DisputeHearings = disputeHearings.Count,
            EmptyHearings = emptyHearings.Count,
            AvgNext10EmergEmptyHearingDays = avgNext10EmergHearingDays,
            AvgNext10StandardEmptyHearingDays = avgNext10StandardHearingDays,
            AvgNext10DeferredEmptyHearingDays = avgNext10DeferredHearingDays,
            Files = files?.Count ?? 0,
            FilesMb = Utils.ConvertBytesToMegabytes(filesMb),
            EvidenceFiles = evidenceFiles?.Count ?? 0,
            EvidenceFilesMb = Utils.ConvertBytesToMegabytes(evidenceFilesMb),
            StatusWaitingProofService = statusWaitingProofServices.Count(),
            StatusAbandonedNeedsUpdate = statusAbandonedNeedsUpdates.Count(),
            StatusAbandonedNoService = statusAbandonedNoService.Count(),
            StatusCancelled = statusCancelled.Count(),
            StatusNeedsUpdate = statusNeedsUpdate.Count(),
            StatusWithdrawn = statusWithdrawn.Count(),
            StatusWaitingForDecision = statusWaitingForDecision.Count,
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
            IntakeProcessed = intakeProcessedCount
        };

        return factTimeStatistics;
    }
}