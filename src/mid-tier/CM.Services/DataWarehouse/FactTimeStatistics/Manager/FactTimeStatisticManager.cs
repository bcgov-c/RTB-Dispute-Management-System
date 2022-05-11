using System;
using System.Linq;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;
using CM.Services.DataWarehouse.DataWarehouseDataModel.Models;
using CM.Services.DataWarehouse.DataWarehouseRepository.UnitOfWork;
using Serilog;

namespace CM.Services.DataWarehouse.FactTimeStatistics.Manager
{
    public static class FactTimeStatisticManager
    {
        #region Array

        private static readonly int[] Stage0OpenArray = { 1, 2, 3, 4, 6 };
        private static readonly int[] StageOpenArray = { 90, 91, 92, 93, 94 };

        #endregion

        public static async Task Record(IUnitOfWork unitOfWork, IUnitOfWorkDataWarehouse dwUnitOfWork, ILogger logger)
        {
            var timezone = TimeZoneInfo.FindSystemTimeZoneById("Pacific Standard Time");
            var dateTimePst = TimeZoneInfo.ConvertTime(DateTime.UtcNow, timezone);

            var start = dateTimePst.AddDays(-1).Date + new TimeSpan(0, 0, 0);
            var end = dateTimePst.AddDays(-1).Date + new TimeSpan(23, 59, 59);

            try
            {
                var associatedId = await dwUnitOfWork.DimTimeRepository.GetIdByDate(start.ToUniversalTime());

                var openFilesCount = await unitOfWork.DisputeRepository.GetOpenDisputesCount();

                var disputefees = await unitOfWork.DisputeFeeRepository.GetDisputeFeesByPaidDate(start.ToUniversalTime(), end.ToUniversalTime());

                var disputesIpd = await unitOfWork.DisputeRepository.GetDisputeByInitialPaymentDate(start.ToUniversalTime(), end.ToUniversalTime());

                var disputeHearings = await unitOfWork.DisputeHearingRepository.GetDisputeHearingsByHearingStartDate(start.ToUniversalTime(), end.ToUniversalTime());

                var emptyHearings = await unitOfWork.HearingRepository.GetHearingsByHearingStartDate(start.ToUniversalTime(), end.ToUniversalTime(), disputeHearings);

                var avgNext10EmergHearingDays = await unitOfWork.HearingRepository.GetAvgNext10HearingDays(8, 1);

                var avgNext10StandardHearingDays = await unitOfWork.HearingRepository.GetAvgNext10HearingDays(21, 2);

                var avgNext10DeferredHearingDays = await unitOfWork.HearingRepository.GetAvgNext10HearingDays(21, 3);

                var files = await unitOfWork.FileRepository.GetFilesByCreatedDate(start.ToUniversalTime(), end.ToUniversalTime());

                var evidenceFiles = await unitOfWork.FileRepository.GetEvidenceFilesByCreatedDate(start.ToUniversalTime(), end.ToUniversalTime(), files);

                var activeFiles = await unitOfWork.FileRepository.GetActiveFiles();

                var statusWaitingProofServices = activeFiles
                    .Where(x => x.Dispute.DisputeStatuses
                    .OrderByDescending(x => x.DisputeStatusId).FirstOrDefault().Status == (byte)DisputeStatuses.WaitingForProofOfService);

                var statusAbandonedNeedsUpdates = activeFiles
                    .Where(x => x.Dispute.DisputeStatuses
                    .OrderByDescending(x => x.DisputeStatusId).FirstOrDefault().Status == (byte)DisputeStatuses.AbandonedApplicantInaction &&
                    x.Dispute.DisputeStatuses
                    .OrderByDescending(x => x.DisputeStatusId).FirstOrDefault().Stage == (byte)DisputeStage.ApplicationInProgress);

                var statusAbandonedNoService = activeFiles
                    .Where(x => x.Dispute.DisputeStatuses
                    .OrderByDescending(x => x.DisputeStatusId).FirstOrDefault().Status == (byte)DisputeStatuses.AbandonedApplicantInaction &&
                    x.Dispute.DisputeStatuses
                    .OrderByDescending(x => x.DisputeStatusId).FirstOrDefault().Stage == (byte)DisputeStage.ServingDocuments);

                var statusCancelled = activeFiles
                    .Where(x => x.Dispute.DisputeStatuses
                    .OrderByDescending(x => x.DisputeStatusId).FirstOrDefault().Status == (byte)DisputeStatuses.WaitingForProofOfService);

                var disputeStatuses = await unitOfWork.DisputeStatusRepository.GetStatusesByStatusStartDate(start.ToUniversalTime(), end.ToUniversalTime());

                var statusNeedsUpdate = disputeStatuses.DistinctBy(x => x.DisputeGuid).Where(x => x.Status >= (byte)DisputeStatuses.PaymentRequired && x.Status <= (byte)DisputeStatuses.PaperApplicationUpdateRequired);

                var statusWithdrawn = activeFiles
                    .Where(x => x.Dispute.DisputeStatuses
                    .OrderByDescending(x => x.DisputeStatusId).FirstOrDefault().Status == (byte)DisputeStatuses.Withdrawn &&
                    x.Dispute.DisputeStatuses.OrderByDescending(x => x.DisputeStatusId).FirstOrDefault().StatusStartDate >= start.ToUniversalTime() &&
                    x.Dispute.DisputeStatuses.OrderByDescending(x => x.DisputeStatusId).FirstOrDefault().StatusStartDate <= end.ToUniversalTime());

                var statusWaitingForDecision = activeFiles
                    .Where(x => x.Dispute.DisputeStatuses
                    .OrderByDescending(x => x.DisputeStatusId).FirstOrDefault().Status == (byte)DisputeStatuses.DecisionPending ||
                    x.Dispute.DisputeStatuses
                    .OrderByDescending(x => x.DisputeStatusId).FirstOrDefault().Status == (byte)DisputeStatuses.InterimDecisionPending ||
                    x.Dispute.DisputeStatuses
                    .OrderByDescending(x => x.DisputeStatusId).FirstOrDefault().Status == (byte)DisputeStatuses.ClarificationDecisionPending ||
                    x.Dispute.DisputeStatuses
                    .OrderByDescending(x => x.DisputeStatusId).FirstOrDefault().Status == (byte)DisputeStatuses.CorrectionDecisionPending);

                var statusesForOldest = await unitOfWork
                    .DisputeStatusRepository
                    .FindAllAsync(x => x.IsActive
                    && (x.Status == (byte)DisputeStatuses.DecisionPending ||
                        x.Status == (byte)DisputeStatuses.InterimDecisionPending ||
                        x.Status == (byte)DisputeStatuses.ClarificationDecisionPending ||
                        x.Status == (byte)DisputeStatuses.CorrectionDecisionPending));
                var statusWaitingForDecisionOldest = statusesForOldest.ToList().OrderBy(x => x.StatusStartDate).FirstOrDefault().StatusStartDate;

                var statusDecisionsReadyToSend = activeFiles
                    .Where(x => x.Dispute.DisputeStatuses
                    .OrderByDescending(x => x.DisputeStatusId).FirstOrDefault().Status == (byte)DisputeStatuses.DecisionReadyToSend);

                var outcomeDocRequests = await unitOfWork.OutcomeDocRequestRepository.GetRequestsBySubmittedDate(start.ToUniversalTime(), end.ToUniversalTime());

                var correctionRequests = outcomeDocRequests.Where(x => x.RequestType == OutcomeDocRequestType.Correction);

                var clarificationRequests = outcomeDocRequests.Where(x => x.RequestType == OutcomeDocRequestType.Clarification);

                var reviewRequests = outcomeDocRequests.Where(x => x.RequestType == OutcomeDocRequestType.ReviewRequest);

                var statusClosed = activeFiles
                    .Where(x => x.Dispute.DisputeStatuses
                    .OrderByDescending(x => x.DisputeStatusId).FirstOrDefault().Status == (byte)DisputeStatuses.Closed);

                var stage0Open = activeFiles
                    .Where(x => x.Dispute.DisputeStatuses.OrderByDescending(x => x.DisputeStatusId).FirstOrDefault().Stage == (byte)DisputeStage.ApplicationInProgress &&
                    Stage0OpenArray.Contains(x.Dispute.DisputeStatuses.OrderByDescending(x => x.DisputeStatusId).FirstOrDefault().Status));

                var stage2Open = activeFiles
                    .Where(x => x.Dispute.DisputeStatuses.OrderByDescending(x => x.DisputeStatusId).FirstOrDefault().Stage == (byte)DisputeStage.ApplicationScreening &&
                    !StageOpenArray.Contains(x.Dispute.DisputeStatuses.OrderByDescending(x => x.DisputeStatusId).FirstOrDefault().Status));

                var stage4Open = activeFiles
                    .Where(x => x.Dispute.DisputeStatuses.OrderByDescending(x => x.DisputeStatusId).FirstOrDefault().Stage == (byte)DisputeStage.ServingDocuments &&
                    !StageOpenArray.Contains(x.Dispute.DisputeStatuses.OrderByDescending(x => x.DisputeStatusId).FirstOrDefault().Status));

                var stage6Open = activeFiles
                    .Where(x => x.Dispute.DisputeStatuses.OrderByDescending(x => x.DisputeStatusId).FirstOrDefault().Stage == (byte)DisputeStage.HearingPending &&
                    !StageOpenArray.Contains(x.Dispute.DisputeStatuses.OrderByDescending(x => x.DisputeStatusId).FirstOrDefault().Status));

                var stage8Open = activeFiles
                    .Where(x => x.Dispute.DisputeStatuses.OrderByDescending(x => x.DisputeStatusId).FirstOrDefault().Stage == (byte)DisputeStage.Hearing &&
                    !StageOpenArray.Contains(x.Dispute.DisputeStatuses.OrderByDescending(x => x.DisputeStatusId).FirstOrDefault().Status));

                var stage10Open = activeFiles
                    .Where(x => x.Dispute.DisputeStatuses.OrderByDescending(x => x.DisputeStatusId).FirstOrDefault().Stage == (byte)DisputeStage.DecisionAndPostSupport &&
                    !StageOpenArray.Contains(x.Dispute.DisputeStatuses.OrderByDescending(x => x.DisputeStatusId).FirstOrDefault().Status));

                var stage2Unassigned = activeFiles
                    .Where(x => x.Dispute.DisputeStatuses.OrderByDescending(x => x.DisputeStatusId).FirstOrDefault().Stage == (byte)DisputeStage.ApplicationScreening &&
                    !StageOpenArray.Contains(x.Dispute.DisputeStatuses.OrderByDescending(x => x.DisputeStatusId).FirstOrDefault().Status) &&
                    x.Dispute.DisputeStatuses.OrderByDescending(x => x.DisputeStatusId).FirstOrDefault().Owner == null);

                var statusesForUnassignedOldest = await unitOfWork
                    .DisputeStatusRepository
                    .FindAllAsync(x => x.IsActive
                    && x.Stage == (byte)DisputeStage.ApplicationScreening
                    && !StageOpenArray.Contains(x.Status));
                var stage2UnassignedOldest = statusesForUnassignedOldest.ToList().OrderBy(x => x.StatusStartDate).FirstOrDefault().StatusStartDate;

                var stage2Assigned = activeFiles
                    .Where(x => x.Dispute.DisputeStatuses.OrderByDescending(x => x.DisputeStatusId).FirstOrDefault().Stage == (byte)DisputeStage.ApplicationScreening &&
                    !StageOpenArray.Contains(x.Dispute.DisputeStatuses.OrderByDescending(x => x.DisputeStatusId).FirstOrDefault().Status) &&
                    x.Dispute.DisputeStatuses.OrderByDescending(x => x.DisputeStatusId).FirstOrDefault().Owner != null);

                var statusesForAssignedOldest = await unitOfWork
                    .DisputeStatusRepository
                    .FindAllAsync(x => x.IsActive == true
                    && x.Stage == (byte)DisputeStage.ApplicationScreening
                    && !StageOpenArray.Contains(x.Status)
                    && x.Owner != null);
                var stage2AssignedOldest = statusesForAssignedOldest.ToList().OrderBy(x => x.StatusStartDate).FirstOrDefault().StatusStartDate;

                var statusRescheduledUnassigned = activeFiles
                    .Where(x => x.Dispute.DisputeStatuses.OrderByDescending(x => x.DisputeStatusId).FirstOrDefault().Status == (byte)DisputeStatuses.ToBeRescheduled &&
                    x.Dispute.DisputeStatuses.OrderByDescending(x => x.DisputeStatusId).FirstOrDefault().Owner == null);

                var statusRescheduledAssigned = activeFiles
                    .Where(x => x.Dispute.DisputeStatuses.OrderByDescending(x => x.DisputeStatusId).FirstOrDefault().Status == (byte)DisputeStatuses.ToBeRescheduled &&
                    x.Dispute.DisputeStatuses.OrderByDescending(x => x.DisputeStatusId).FirstOrDefault().Owner != null);

                var tasks = await unitOfWork.TaskRepository.GetAllAsync();

                var iOIncompleteTasksUnassigned = tasks.Where(x => x.TaskSubType == 1 && x.TaskStatus != 1 && x.TaskOwnerId == null);

                var iOIncompleteTasksUnassignedOldest = iOIncompleteTasksUnassigned.OrderByDescending(x => x.CreatedDate).FirstOrDefault().CreatedDate;

                var iOIncompleteTasksAssigned = tasks.Where(x => x.TaskSubType == 1 && x.TaskStatus != 1 && x.TaskOwnerId != null);

                var iOTasksCompleted = tasks.Where(x => x.TaskSubType == 1 && x.TaskStatus == 1 && x.ModifiedDate >= start.ToUniversalTime() && x.ModifiedDate <= start.ToUniversalTime());

                var arbIncompleteTasksAssigned = tasks.Where(x => x.TaskSubType == 1 && x.TaskStatus != 1 && x.TaskOwnerId == null);

                var arbIncompleteTasksUnassigned = tasks.Where(x => x.TaskSubType == 2 && x.TaskStatus != 1 && x.TaskOwnerId == null);

                var arbIncompleteTasksUnassignedOldest = arbIncompleteTasksUnassigned.Count() > 0 ? arbIncompleteTasksUnassigned.OrderByDescending(x => x.CreatedDate).FirstOrDefault().CreatedDate : default(DateTime);

                var arbTasksCompleted = tasks.Where(x => x.TaskSubType == 1 && x.TaskStatus == 1 && x.ModifiedDate >= start.ToUniversalTime() && x.ModifiedDate <= start.ToUniversalTime());

                var otherIncompleteTasks = tasks.Where(x => x.TaskSubType != 1 && x.TaskSubType != 2 && x.TaskStatus != 1 && x.TaskOwnerId == null);

                var outcomeDocDeliveries = await unitOfWork.OutcomeDocDeliveryRepository.GetAllAsync();

                var documentsUndelivered = outcomeDocDeliveries.Where(x => x.ReadyForDelivery == true && x.IsDelivered != true).DistinctBy(x => x.OutcomeDocFileId);

                var documentsUndeliveredOldest = documentsUndelivered.OrderByDescending(x => x.ReadyForDeliveryDate).FirstOrDefault().ReadyForDeliveryDate;

                var documentsUndeliveredUrgent = outcomeDocDeliveries.Where(x => x.ReadyForDelivery == true && x.IsDelivered != true && x.DeliveryPriority == 2).DistinctBy(x => x.OutcomeDocFileId);

                var documentsUndeliveredUrgentOldest = documentsUndeliveredUrgent.OrderByDescending(x => x.ReadyForDeliveryDate).FirstOrDefault().ReadyForDeliveryDate;

                var documentsDelivered = outcomeDocDeliveries.Where(x => x.ReadyForDelivery == true && x.IsDelivered == true).DistinctBy(x => x.OutcomeDocFileId);

                var factTimeStatistics = new FactTimeStatistic
                {
                    LoadDateTime = DateTime.UtcNow,
                    AssociatedOffice = (int)Offices.Rtbbc,
                    IsActive = true,
                    IsPublic = true,
                    StatisticsType = 1,
                    AssociatedDate = start.ToUniversalTime().Date,
                    AssociatedDateId = associatedId,
                    OpenFiles = openFilesCount,
                    IntakePayments = disputefees.Where(x => x.FeeType == 1).Count(),
                    ReviewPayments = disputefees.Where(x => x.FeeType == 2).Count(),
                    PerUnitPayments = disputefees.Where(x => x.FeeType == 4).Count(),
                    OnlineDisputesPaid = disputesIpd.Where(x => x.CreationMethod == 1 || x.CreationMethod == 4 || x.CreationMethod == 5).Count(),
                    OfficeDisputesPaid = disputesIpd.Where(x => x.CreationMethod == 2).Count(),
                    Process1DisputesPaid = disputesIpd.Where(x => x.DisputeStatuses.OrderByDescending(x => x.DisputeStatusId).FirstOrDefault().Process == 1).Count(),
                    Process2DisputesPaid = disputesIpd.Where(x => x.DisputeStatuses.OrderByDescending(x => x.DisputeStatusId).FirstOrDefault().Process == 2).Count(),
                    TenantDisputesPaid = disputesIpd.Where(x => x.DisputeSubType == 1).Count(),
                    LandlordDisputesPaid = disputesIpd.Where(x => x.DisputeSubType == 0).Count(),
                    EmergencyDisputesPaid = disputesIpd.Where(x => x.DisputeUrgency == 1).Count(),
                    StandardDisputesPaid = disputesIpd.Where(x => x.DisputeUrgency == 2).Count(),
                    DeferredDisputesPaid = disputesIpd.Where(x => x.DisputeUrgency == 3).Count(),
                    DisputeHearings = disputeHearings.Count(),
                    EmptyHearings = emptyHearings.Count(),
                    AvgNext10EmergHearingDays = avgNext10EmergHearingDays,
                    AvgNext10StandardHearingDays = avgNext10StandardHearingDays,
                    AvgNext10DeferredHearingDays = avgNext10DeferredHearingDays,
                    Files = files.Count(),
                    FilesMB = (int)(files.Sum(x => x.FileSize) / Constants.BytesInMegabytes),
                    EvidenceFiles = evidenceFiles.Count(),
                    EvidenceFilesMB = (int)(evidenceFiles.Sum(x => x.FileSize) / Constants.BytesInMegabytes),
                    StatusWaitingProofService = statusWaitingProofServices.Count(),
                    StatusAbandonedNeedsUpdate = statusAbandonedNeedsUpdates.Count(),
                    StatusAbandonedNoService = statusAbandonedNoService.Count(),
                    StatusCancelled = statusCancelled.Count(),
                    StatusNeedsUpdate = statusNeedsUpdate.Count(),
                    StatusWithdrawn = statusWithdrawn.Count(),
                    StatusWaitingForDecision = statusWaitingForDecision.Count(),
                    StatusWaitingForDecisionOldest = statusWaitingForDecisionOldest,
                    StatusDecisionsReadyToSend = statusDecisionsReadyToSend.Count(),
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
                    Stage2Unassigned = stage2Unassigned.Count(),
                    Stage2UnassignedOldest = stage2UnassignedOldest,
                    Stage2Assigned = stage2Assigned.Count(),
                    Stage2AssignedOldest = stage2AssignedOldest,
                    StatusRescheduledUnassigned = statusRescheduledUnassigned.Count(),
                    StatusRescheduledAssigned = statusRescheduledAssigned.Count(),
                    IOIncompleteTasksUnassigned = iOIncompleteTasksUnassigned.Count(),
                    IOIncompleteTasksUnassignedOldest = iOIncompleteTasksUnassignedOldest.Value,
                    IOIncompleteTasksAssigned = iOIncompleteTasksAssigned.Count(),
                    IOTasksCompleted = iOTasksCompleted.Count(),
                    ArbIncompleteTasksAssigned = arbIncompleteTasksAssigned.Count(),
                    ArbIncompleteTasksUnassigned = arbIncompleteTasksUnassigned.Count(),
                    ArbIncompleteTasksUnassignedOldest = arbIncompleteTasksUnassignedOldest.Value,
                    ArbTasksCompleted = arbTasksCompleted.Count(),
                    OtherIncompleteTasks = otherIncompleteTasks.Count(),
                    DocumentsUndelivered = documentsUndelivered.Count(),
                    DocumentsUndeliveredOldest = documentsUndeliveredOldest.Value,
                    DocumentsUndeliveredUrgent = documentsUndeliveredUrgent.Count(),
                    DocumentsUndeliveredUrgentOldest = documentsUndeliveredUrgentOldest.Value,
                    DocumentsDelivered = documentsDelivered.Count()
                };

                await dwUnitOfWork.FactTimeStatisticRepository.InsertAsync(factTimeStatistics);
                var res = await dwUnitOfWork.Complete();

                if (res.CheckSuccess())
                {
                    logger.Information("FactTimeStatistic recorded");
                }
            }
            catch (Exception e)
            {
                logger.Error(e.Message, e);
            }
        }
    }
}
