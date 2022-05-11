using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;
using CM.Services.DataWarehouse.DataWarehouseDataModel.Models;
using CM.Services.DataWarehouse.DataWarehouseRepository.RequestResponseModels;
using CM.Services.DataWarehouse.DataWarehouseRepository.UnitOfWork;
using CM.Services.DataWarehouse.FactDisputeService.Common;
using CM.Services.DataWarehouse.FactDisputeService.Helper;
using Serilog;

namespace CM.Services.DataWarehouse.FactDisputeService.Managers;

public class FactDisputeSummaryManager : StatisticManagerBase
{
    private static bool _anyFailed;
    private static int[] outcomeDocFileTypes = { 1, 2, 3, 4, 5, 6, 7, 8, 25, 30, 31, 32, 33, 40, 41, 42, 45, 46, 47, 50, 55, 60 };
    private static int[] outcomeDocFileTypesOrdersPossession = { 10, 11 };
    private static int[] outcomeDocFileTypesOrderMonetary = { 15, 16 };
    private static int[] outcomeDocFileTypesDecisionsInterim = { 30, 31, 32, 33, 60 };

    public FactDisputeSummaryManager(IUnitOfWork unitOfWork, IUnitOfWorkDataWarehouse dwUnitOfWork, ILogger logger)
        : base(unitOfWork, dwUnitOfWork, logger)
    {
    }

    public async Task RecordClosedDisputes(List<ExistedFileNumbersResponse> fileNumbersResponse, int dateDelay)
    {
        var lastLoadedDateTime = await DwUnitOfWork.LoadingHistoryRepository.GetLastLoadStartDateTime();

        var existedDisputeGuids = fileNumbersResponse.Select(x => x.DisputeGuid).ToList();
        var disputes = await UnitOfWork.DisputeRepository.GetDisputesWithLastModify(existedDisputeGuids, lastLoadedDateTime, dateDelay);
        var dwDisputesGuid = await DwUnitOfWork.FactDisputeSummaryRepository.GetDelayedDisputes(dateDelay);
        var dwDisputes = await UnitOfWork.DisputeRepository.GetDisputesByDisputeGuid(dwDisputesGuid);
        disputes = disputes.Union(dwDisputes).ToList();

        var insertedCount = 0;

        var loadingEventId = await LoadingHistoryManager.InsertLoadingHistory(FactTable.FDisputeSummary);

        try
        {
            foreach (var dispute in disputes)
            {
                LogInformation($"FileNumber = {dispute.FileNumber}");

                if (dispute.FileNumber.HasValue && existedDisputeGuids.Contains(dispute.DisputeGuid))
                {
                    LogInformation($"Closed Dispute fileNumber existed {dispute.FileNumber}");

                    if (dispute.DisputeLastModified == null)
                    {
                        LogInformation($"Closed Dispute not existed in DisputeLastModified table for fileNumber = {dispute.FileNumber}");
                        continue;
                    }

                    LogInformation($"Closed Dispute fileNumber needs to update {dispute.FileNumber}");

                    var isUpdated = await RecordFactDisputeSummary(dispute.FileNumber.Value, RecordType.Update);

                    if (isUpdated)
                    {
                        LogInformation($"Closed Dispute fileNumber updated {dispute.FileNumber}");
                        insertedCount += 1;
                    }
                    else
                    {
                        LogInformation($"Update is failed for {dispute.FileNumber}");
                        _anyFailed = true;
                    }
                }
                else
                {
                    LogInformation($"Closed Dispute fileNumber not exists {dispute.FileNumber}");

                    var isInserted = dispute.FileNumber != null && await RecordFactDisputeSummary(dispute.FileNumber.Value, RecordType.Add);

                    if (isInserted)
                    {
                        LogInformation($"Closed Dispute fileNumber inserted {dispute.FileNumber}");
                        insertedCount += 1;
                    }
                    else
                    {
                        LogInformation($"Insert is failed for {dispute.FileNumber}");
                        _anyFailed = true;
                    }
                }
            }
        }
        catch (Exception ex)
        {
            await LoadingHistoryManager.UpdateLoadingHistory(loadingEventId, LoadingHistoryStatus.Failed, ex.Message, insertedCount);
            return;
        }

        await LoadingHistoryManager.UpdateLoadingHistory(loadingEventId, _anyFailed ? LoadingHistoryStatus.Failed : LoadingHistoryStatus.LoadComplete, string.Empty, insertedCount);
    }

    private async Task<bool> RecordFactDisputeSummary(int fileNumber, RecordType type)
    {
        LogInformation($"Start Record FileNumber {fileNumber}");

        try
        {
            var factDisputeSummary = await GetRecordAsync(fileNumber, type);

            LogInformation("Entity created");

            if (type == RecordType.Add)
            {
                await DwUnitOfWork.FactDisputeSummaryRepository.InsertAsync(factDisputeSummary);
            }
            else
            {
                DwUnitOfWork.FactDisputeSummaryRepository.Attach(factDisputeSummary);
            }

            var res = await DwUnitOfWork.Complete();
            if (res.CheckSuccess())
            {
                LogInformation($"FileNumber recorded {fileNumber}");
                return await Task.FromResult(true);
            }
        }
        catch (Exception ex)
        {
            LogError($"Error during record for FileNumber={fileNumber}", ex);
        }

        return false;
    }

    private async Task<FactDisputeSummary> GetRecordAsync(int fileNumber, RecordType type)
    {
        var dispute = await UnitOfWork.DisputeRepository.GetDisputeByFileNumber(fileNumber);
        var disputeStatuses = await UnitOfWork.DisputeStatusRepository.FindAllAsync(x => x.DisputeGuid == dispute.DisputeGuid);
        var disputeUniqueStatusesStagesProcesses = await CommonFieldsLoader.GetUniqueStatusesCount(UnitOfWork, dispute.DisputeGuid);

        LogInformation($"Start get record for dispute guid = {dispute.DisputeGuid}");

        var citizenStatuses = new[]
        {
            DisputeStatuses.SavedNotSubmitted,
            DisputeStatuses.UpdateRequired,
            DisputeStatuses.PaymentRequired,
            DisputeStatuses.FeeWaiverProofRequired,
            DisputeStatuses.OfficePaymentRequired,
            DisputeStatuses.OfficeUploadRequired,
            DisputeStatuses.PaperApplicationUpdateRequired,
            DisputeStatuses.WaitingForDocumentsPickUp,
            DisputeStatuses.WaitingForProofOfService,
            DisputeStatuses.WaitingResponse,
            DisputeStatuses.WaitingForAllowedEvidence
        };

        var citizenStatusList = await UnitOfWork
            .DisputeStatusRepository
            .FindAllAsync(x => x.DisputeGuid == dispute.DisputeGuid && citizenStatuses.Contains((DisputeStatuses)x.Status));
        var allParticipants = await UnitOfWork.ParticipantRepository.FindAllAsync(x => x.DisputeGuid == dispute.DisputeGuid);
        var participants = allParticipants.Where(x => x.ParticipantStatus != (byte)ParticipantStatus.Removed && x.ParticipantStatus != (byte)ParticipantStatus.Deleted).ToList();
        LogInformation($"Participants count = {participants.Count}");
        var disputeUsers = await UnitOfWork.DisputeUserRepository.FindAllAsync(x => x.DisputeGuid == dispute.DisputeGuid && x.SystemUser.SystemUserRoleId == (int)Roles.AccessCodeUser);
        var applicants = await UnitOfWork.ClaimGroupParticipantRepository.FindAllAsync(x => x.DisputeGuid == dispute.DisputeGuid
            && (x.Participant.ParticipantStatus != (byte)ParticipantStatus.Removed && x.Participant.ParticipantStatus != (byte)ParticipantStatus.Deleted)
            && x.GroupParticipantRole == (byte)GroupParticipantRole.Applicant);
        var respondents = await UnitOfWork.ClaimGroupParticipantRepository.FindAllAsync(x => x.DisputeGuid == dispute.DisputeGuid
            && (x.Participant.ParticipantStatus != (byte)ParticipantStatus.Removed && x.Participant.ParticipantStatus != (byte)ParticipantStatus.Deleted)
            && x.GroupParticipantRole == (byte)GroupParticipantRole.Respondent);
        LogInformation($"applicants and respondents counts are = {applicants.Count} and {respondents.Count}");
        var claimGroups = await UnitOfWork.ClaimGroupRepository.FindAllAsync(x => x.DisputeGuid == dispute.DisputeGuid);
        LogInformation($"ClaimGroups count = {claimGroups.Count}");
        var claimGroupIds = claimGroups.Select(x => x.ClaimGroupId);
        var allClaims = await UnitOfWork.ClaimRepository.FindAllAsync(x => claimGroupIds.Contains(x.ClaimGroupId));
        LogInformation($"AllClaims count = {allClaims.Count}");
        var claims = await CommonFieldsLoader.GetDisputesClaims(UnitOfWork, new List<Guid?> { dispute.DisputeGuid });
        LogInformation($"Claims count = {claims.Count}");
        var claimIds = claims.Select(x => x.ClaimId);
        var awardRemediesStatuses = new byte?[] { (byte)RemedyStatus.Open, (byte)RemedyStatus.Withdrawn, (byte)RemedyStatus.Dismissed, (byte)RemedyStatus.Severed, (byte)RemedyStatus.AwardApplicant };
        var remedies = await UnitOfWork.RemedyRepository
            .FindAllAsync(x => claimIds.Contains(x.ClaimId) && awardRemediesStatuses.Contains(x.RemedyStatus));
        LogInformation($"Remedies count = {remedies.Count}");

        var awardedPossessionsStatuses = new byte?[] { (byte)RemedyStatus.Open, (byte)RemedyStatus.Withdrawn, (byte)RemedyStatus.Dismissed };
        var awardedPossessions = await UnitOfWork.RemedyRepository
            .FindAllAsync(x => claimIds.Contains(x.ClaimId) && awardedPossessionsStatuses.Contains(x.RemedyStatus));
        var awardedAmountSum = remedies.Sum(x => x.AwardedAmount);
        var remediesForRequested = await UnitOfWork.RemedyRepository.FindAllAsync(x => claimIds.Contains(x.ClaimId));
        LogInformation($"RemediesForRequested count = {remediesForRequested.Count}");
        var remediesRequestedAmount = await CommonFieldsLoader.GetLinkedRequestedAmount(UnitOfWork, claimIds);
        var remediesForAwardedMonetaryOrders = remediesForRequested.Where(x => x.AwardedAmount > 0 && awardRemediesStatuses.Contains(x.RemedyStatus)).ToList();
        LogInformation($"RemediesForAwardedMonetaryOrders count = {remediesForAwardedMonetaryOrders.Count}");

        var notes = await UnitOfWork.NoteRepository.FindAllAsync(x => x.DisputeGuid == dispute.DisputeGuid);
        var tasks = await UnitOfWork.TaskRepository.FindAllAsync(x => x.DisputeGuid == dispute.DisputeGuid);
        var sentMessagesCount = await CommonFieldsLoader.GetSentEmailMessagesCount(UnitOfWork, dispute.DisputeGuid);
        var disputeHearings = await CommonFieldsLoader.GetDisputeHearings(UnitOfWork, dispute.DisputeGuid);
        var crossDisputeHearings = disputeHearings.Where(x => x.SharedHearingLinkType == (byte)SharedHearingLinkType.Cross);
        var hearingParticipations = await UnitOfWork.HearingParticipationRepository.FindAllAsync(x => x.DisputeGuid == dispute.DisputeGuid && x.ParticipationStatus == 1 && disputeHearings.Select(dh => dh.HearingId).Contains(x.HearingId));
        var notices = await UnitOfWork.NoticeRepository.FindAllAsync(x => x.DisputeGuid == dispute.DisputeGuid && (x.NoticeType == (byte)NoticeTypes.GeneratedDisputeNotice || x.NoticeType == (byte)NoticeTypes.UploadedDisputeNotice || x.NoticeType == (byte)NoticeTypes.UploadedOtherNotice));
        var disputeNotices = await UnitOfWork.NoticeRepository.FindAllAsync(x => x.DisputeGuid == dispute.DisputeGuid);
        LogInformation($"DisputeNotices count = {disputeNotices.Count}");
        var noticeServices = await UnitOfWork.NoticeServiceRepository.FindAllAsync(x => x.IsServed == true && disputeNotices.Select(n => n.NoticeId).Contains(x.NoticeId));
        var amendmentsCount = await CommonFieldsLoader.GetAmendmentsCount(UnitOfWork, dispute.DisputeGuid);
        var subServices = await UnitOfWork.SubstitutedServiceRepository.FindAllAsync(x => x.DisputeGuid == dispute.DisputeGuid);

        var linkedFiles = await CommonFieldsLoader.GetLinkedEvidenceFiles(UnitOfWork, new List<Guid?> { dispute.DisputeGuid });
        LogInformation($"LinkedFiles count = {linkedFiles.Count}");
        var fileIds = linkedFiles.Select(x => x.FileId);
        var evidencePackages = await UnitOfWork.FilePackageRepository.FindAllAsync(x => x.DisputeGuid == dispute.DisputeGuid);
        LogInformation($"EvidencePackages count = {evidencePackages.Count}");
        var evidencePackageServices = await UnitOfWork.FilePackageServiceRepository.GetServicesWithPackages(dispute.DisputeGuid, true);
        var associatedFiles = await UnitOfWork.FileRepository.FindAllAsync(x => fileIds.Contains(x.FileId));
        LogInformation($"AssociatedFiles count = {associatedFiles.Count}");
        var fileSizesSum = CommonFieldsLoader.GetLinkedEvidenceFilesMb(UnitOfWork, linkedFiles, associatedFiles);
        LogInformation($"fileSizesSum count = {fileSizesSum}");
        var claimGroupParticipants = await UnitOfWork.ClaimGroupParticipantRepository.FindAllAsync(x => x.DisputeGuid == dispute.DisputeGuid);
        LogInformation($"ClaimGroupParticipants count = {claimGroupParticipants.Count}");
        var applicantClaimGroupParticipants = claimGroupParticipants.Where(x => x.GroupParticipantRole == (byte)GroupParticipantRole.Applicant).ToList();
        LogInformation($"ApplicantClaimGroupParticipants count = {applicantClaimGroupParticipants.Count}");
        var applicantsId = applicantClaimGroupParticipants.Select(x => x.ParticipantId).ToList();
        var applicantsFileDescriptions = await UnitOfWork.FileDescriptionRepository.FindAllAsync(x => x.DisputeGuid == dispute.DisputeGuid
            && (x.DescriptionCategory == (byte)FileDescriptionCategories.OtherEvidenceNotAssociatedToClaims
                || x.DescriptionCategory == (byte)FileDescriptionCategories.OtherEvidenceAssociatedToClaims
                || x.DescriptionCategory == (byte)FileDescriptionCategories.Nine)
            && (x.DescriptionCode != (byte)FileDescriptionCodes.MonetaryOrderWorksheet
                && x.DescriptionCode != (byte)FileDescriptionCodes.TenancyAgreement)
            && applicantsId.Contains(x.DescriptionBy.Value));
        LogInformation($"ApplicantsFileDescriptions count = {applicantsFileDescriptions.Count}");
        var applicantsFileDescIds = applicantsFileDescriptions.Select(x => x.FileDescriptionId);
        var applicantsLinkedFiles = await UnitOfWork.LinkedFileRepository.FindAllAsync(x => x.DisputeGuid == dispute.DisputeGuid && applicantsFileDescIds.Contains(x.FileDescriptionId));
        LogInformation($"ApplicantsLinkedFiles count = {applicantsLinkedFiles.Count}");
        var applicantsFileIds = applicantsLinkedFiles.Select(x => x.FileId);

        var respondentClaimGroupParticipants = claimGroupParticipants.Where(x => x.GroupParticipantRole == (byte)GroupParticipantRole.Respondent).ToList();
        LogInformation($"RespondentClaimGroupParticipants count = {respondentClaimGroupParticipants.Count}");
        var respondentsId = respondentClaimGroupParticipants.Select(x => x.ParticipantId).ToList();
        var respondentsFileDescriptions = await UnitOfWork.FileDescriptionRepository.FindAllAsync(x => x.DisputeGuid == dispute.DisputeGuid
            && (x.DescriptionCategory == (byte)FileDescriptionCategories.OtherEvidenceNotAssociatedToClaims
                || x.DescriptionCategory == (byte)FileDescriptionCategories.OtherEvidenceAssociatedToClaims
                || x.DescriptionCategory == (byte)FileDescriptionCategories.Nine)
            && (x.DescriptionCode != (byte)FileDescriptionCodes.MonetaryOrderWorksheet
                && x.DescriptionCode != (byte)FileDescriptionCodes.TenancyAgreement)
            && respondentsId.Contains(x.DescriptionBy.Value));
        LogInformation($"RespondentsFileDescriptions count = {respondentsFileDescriptions.Count}");
        var respondentsFileDescIds = respondentsFileDescriptions.Select(x => x.FileDescriptionId);
        var respondentsLinkedFiles = await UnitOfWork.LinkedFileRepository.FindAllAsync(x => x.DisputeGuid == dispute.DisputeGuid && respondentsFileDescIds.Contains(x.FileDescriptionId));
        LogInformation($"RespondentsLinkedFiles count = {respondentsLinkedFiles.Count}");
        var respondentsFileIds = respondentsLinkedFiles.Select(x => x.FileId);

        var disputeOutcomeDocFiles = await UnitOfWork.OutcomeDocFileRepository.GetDisputeOutcomeDocFiles(dispute.DisputeGuid);
        LogInformation($"DisputeOutcomeDocFiles count = {disputeOutcomeDocFiles.Count}");
        var outcomeDocFiles = disputeOutcomeDocFiles.Where(x => x.FileType != (int)OutcomeDocFileTypes.PublicDecision && x.FileType != (int)OutcomeDocFileTypes.ExternalWorkingDocument).ToList();
        LogInformation($"OutcomeDocFiles count = {outcomeDocFiles.Count}");
        var odFiles = outcomeDocFiles.Count > 0 ? outcomeDocFiles.Where(x => x.FileId != null && x.File != null).Select(x => x.File).ToList() : new List<Data.Model.File>();
        LogInformation("This point achieved!!!!!!!!!!");
        LogInformation($"OdFiles count = {odFiles.Count}");
        var odFileSizesSum = odFiles.Count > 0 ? Utils.ConvertBytesToMegabytes(odFiles.Sum(x => x.FileSize)) : 0;
        var outcomeDocDeliveries = await UnitOfWork.OutcomeDocDeliveryRepository.FindAllAsync(x => x.DisputeGuid == dispute.DisputeGuid && x.IsDelivered == true);
        var totalOpenTimeMin = Utils.GetStatusesTotalOpenTime(disputeStatuses.ToList());
        var totalCitizenStatusTime = citizenStatusList.Sum(x => x.DurationSeconds.GetValueOrDefault());
        var totalIoTimeMin = Utils.GetStatusesTotalTime(disputeStatuses.ToList());
        var totalArbTimeMin = Utils.GetStatusesTotalArbTime(disputeStatuses.ToList());
        var disputeFees = await UnitOfWork.DisputeFeeRepository.FindAllAsync(x => x.DisputeGuid == dispute.DisputeGuid && x.IsActive);
        LogInformation($"DisputeFees count = {disputeFees.Count}");
        var transactions = await UnitOfWork.PaymentTransactionRepository.FindAllAsync(x => x.DisputeFee.DisputeGuid == dispute.DisputeGuid && x.DisputeFee.IsActive);
        var totalDisputePayment = disputeFees.Sum(x => x.AmountPaid);
        var lastHearing = disputeHearings.OrderByDescending(x => x.Hearing.HearingStartDateTime).Select(x => x.Hearing).FirstOrDefault();
        var lastStatus = await CommonFieldsLoader.GetLastStatus(UnitOfWork, dispute.DisputeGuid);

        var filePackages = await UnitOfWork.FilePackageRepository.FindAllAsync(x => x.DisputeGuid == dispute.DisputeGuid);
        LogInformation($"FilePackages count = {filePackages.Count}");
        var partiesIdForApplicantsFilePackages = applicantClaimGroupParticipants.Select(x => x.ParticipantId);
        var applicantFilePackages = filePackages.Where(x => partiesIdForApplicantsFilePackages.Contains(x.CreatedById.GetValueOrDefault())).ToList();
        var partiesIdForRespondentsFilePackages = respondentClaimGroupParticipants.Select(x => x.ParticipantId);
        var respondentFilePackages = filePackages.Where(x => partiesIdForRespondentsFilePackages.Contains(x.CreatedById.GetValueOrDefault())).ToList();
        LogInformation($"RespondentFilePackages count = {respondentFilePackages.Count}");
        var applicantFilePackagesId = applicantFilePackages.Select(x => x.FilePackageId);
        var applicantFiles = associatedFiles.Where(x => applicantFilePackagesId.Contains(x.FilePackageId.GetValueOrDefault())).ToList();
        var applicantFileSizesSum = Utils.ConvertBytesToMegabytes(applicantFiles.Sum(x => x.FileSize));
        var respondentFilePackagesId = respondentFilePackages.Select(x => x.FilePackageId);
        var respondentFiles = associatedFiles.Where(x => respondentFilePackagesId.Contains(x.FilePackageId.GetValueOrDefault())).ToList();
        LogInformation($"RespondentFiles count = {respondentFiles.Count}");
        var respondentFileSizesSum = Utils.ConvertBytesToMegabytes(respondentFiles.Sum(x => x.FileSize));

        var outcomeDocFilesSelected = disputeOutcomeDocFiles.Where(x => outcomeDocFileTypes.Contains(x.FileType) && x.FileId.HasValue).ToList();
        var documentSets = outcomeDocFilesSelected.Select(x => x.OutcomeDocGroupId).Distinct();

        var odFilesOrdersMonetary = disputeOutcomeDocFiles.Where(x => outcomeDocFileTypesOrderMonetary.Contains(x.FileType)
                                                                      && x.FileId.HasValue);
        var odFilesOrdersPossession = disputeOutcomeDocFiles.Where(x => outcomeDocFileTypesOrdersPossession.Contains(x.FileType)
                                                                        && x.FileId.HasValue);
        var odFilesDecisionsInterim = disputeOutcomeDocFiles.Where(x => outcomeDocFileTypesDecisionsInterim.Contains(x.FileType)
                                                                        && x.FileId.HasValue);

        var internalUserRoles1 = await UnitOfWork.InternalUserRoleRepository.FindAllAsync(x => x.RoleGroupId == (byte)RoleGroup.InformationOfficer);
        var role1Owners = internalUserRoles1.Select(x => (int?)x.UserId).Distinct().ToList();
        var systemUsers1 = await UnitOfWork.SystemUserRepository.FindAllAsync(x => x.SystemUserRoleId == (int)Roles.StaffUser && role1Owners.Contains(x.SystemUserId));
        var systemUsers1Ids = systemUsers1.Select(x => x.SystemUserId).ToList();
        var disputeStatusesOOwners = disputeStatuses.Where(x => x.Owner.HasValue && systemUsers1Ids.Contains(x.Owner.Value)).DistinctBy(x => x.Owner.GetValueOrDefault());
        var disputeStatusesArbOwnersCount = await CommonFieldsLoader.GetTotalArbOwnersCount(UnitOfWork, disputeStatuses.ToList());
        var stage0Time = disputeStatuses.Where(x => x.Stage == (byte)DisputeStage.ApplicationInProgress).Sum(x => x.DurationSeconds);
        var stage2Time = disputeStatuses.Where(x => x.Stage == (byte)DisputeStage.ApplicationScreening).Sum(x => x.DurationSeconds);
        var stage4Time = disputeStatuses.Where(x => x.Stage == (byte)DisputeStage.ServingDocuments).Sum(x => x.DurationSeconds);
        var stage6Time = CommonFieldsLoader.GetTotalStage6TimeMin(UnitOfWork, disputeStatuses.ToList());
        var stage8Time = CommonFieldsLoader.GetTotalStage8TimeMin(UnitOfWork, disputeStatuses.ToList());
        var stage10Time = disputeStatuses.Where(x => x.Stage == (byte)DisputeStage.DecisionAndPostSupport).Sum(x => x.DurationSeconds);
        var status22Time = disputeStatuses.Where(x => x.Status == (byte)DisputeStatuses.ConfirmingInformation).Sum(x => x.DurationSeconds);
        var status41Time = disputeStatuses.Where(x => x.Status == (byte)DisputeStatuses.WaitingForProofOfService).Sum(x => x.DurationSeconds);
        var status102Time = disputeStatuses.Where(x => x.Status == (byte)DisputeStatuses.DecisionReadyToSend).Sum(x => x.DurationSeconds);

        var hearingsId = disputeHearings.Select(x => x.HearingId).ToList();
        var hearings = await UnitOfWork.HearingRepository.FindAllAsync(x => hearingsId.Contains(x.HearingId));
        LogInformation($"Hearings count = {hearings.Count}");
        var hearingTime = hearings.Sum(x => x.HearingDuration);
        var hearingPrepTime = hearings.Sum(x => x.HearingPrepTime);
        var outcomeDocGroups = await UnitOfWork.OutcomeDocGroupRepository.FindAllAsync(x => x.DisputeGuid == dispute.DisputeGuid);
        LogInformation($"OutcomeDocGroups count = {outcomeDocGroups.Count}");
        var writingTime = outcomeDocGroups.Sum(x => x.DocWritingTime);

        var isAdjourned = CommonFieldsLoader.IsAdjourned(UnitOfWork, disputeStatuses);

        var completedTasks = tasks.Where(x => x.TaskStatus == (byte)TasksStatus.Complete).ToList();
        LogInformation($"CompletedTasks count = {completedTasks.Count}");
        var avgTaskOpenTimeMin = completedTasks.Any() ? (completedTasks.Sum(x => x.UnassignedDurationSeconds)
                                                         + completedTasks.Sum(x => x.UnassignedDurationSeconds)) / (60 * tasks.Count()) : 0;

        var amendRemovedParticipants = allParticipants.Where(x => x.ParticipantStatus == (byte)ParticipantStatus.Removed);
        var amendRemovedIssues = allClaims.Where(x => x.ClaimStatus == (byte)ClaimStatus.Removed);

        var tenancyEndDate = dispute.TenancyEndDate;
        var tenancyUnitType = dispute.TenancyUnitType;

        var outcomeDocRequests = await UnitOfWork.OutcomeDocRequestRepository.GetByDisputeWithChild(dispute.DisputeGuid);

        var requestedReviewConsideration = outcomeDocRequests
            .Where(x => x.RequestType == OutcomeDocRequestType.ReviewRequest)
            .ToList();
        var awardedReviewConsiderations = requestedReviewConsideration
            .Where(x => x.OutcomeDocReqItems.Any(ri => ri.ItemStatus == (byte?)OutcomeDocRequestItemType.MathError)).ToList();

        var requestedClarifications = outcomeDocRequests
            .Where(x => x.RequestType == OutcomeDocRequestType.Clarification)
            .ToList();
        var awardedClarifications = requestedClarifications
            .Where(x => x.RequestStatus == 2
                        && x.OutcomeDocReqItems.Any(ri => ri.ItemStatus == (byte?)OutcomeDocRequestItemType.MathError))
            .ToList();

        var requestedCorrections = outcomeDocRequests
            .Where(x => x.RequestType == OutcomeDocRequestType.Correction)
            .ToList();
        var awardedCorrections = requestedCorrections
            .Where(x => x.OutcomeDocReqItems.Any(ri => ri.ItemStatus == (byte?)OutcomeDocRequestItemType.MathError)).ToList();

        var firstParticipatoryHearingDateTime = hearings.Min(x => x.HearingStartDateTime);
        var firstParticipatoryHearingDateTimeId = await GetTimeIdAsync(firstParticipatoryHearingDateTime);

        var disputeComplexity = dispute.DisputeComplexity;
        var fileTypes = new byte[]
        {
            2, 3, 4, 5, 6, 7, 8, 81, 82, 10, 11, 15, 16, 17, 20,
            21, 22, 30, 31, 32, 33, 34, 35, 60, 65, 66, 67, 68
        };
        var firstDecisionDateTime = outcomeDocGroups
            .Where(x => x.OutcomeDocFiles.Any(od => fileTypes.Contains(od.FileType)))
            .FirstOrDefault()?.DocCompletedDate;
        var firstDecisionDateTimeId = await GetTimeIdAsync(firstDecisionDateTime);

        LogInformation("All fields are get");

        FactDisputeSummary factDisputeSummary;

        if (type == RecordType.Add)
        {
            factDisputeSummary = new FactDisputeSummary
            {
                AssociatedOffice = (int)Offices.Rtbbc,
                IsActive = true,
                IsPublic = false,
                DisputeGuid = dispute.DisputeGuid,
                AvgDocDeliveryTimeMin = 0
            };
        }
        else
        {
            factDisputeSummary = await DwUnitOfWork.FactDisputeSummaryRepository.GetByFileNumber(dispute.DisputeGuid);
        }

        factDisputeSummary.LoadDateTime = DateTime.UtcNow;
        factDisputeSummary.Participants = participants.Count;
        factDisputeSummary.AccessCodeUsers = disputeUsers.Count;
        factDisputeSummary.Applicants = applicants.Count;
        factDisputeSummary.Respondents = respondents.Count;
        factDisputeSummary.Issues = claims.Count;
        factDisputeSummary.AwardedIssues = remedies.Count;

        factDisputeSummary.AwardedAmount = (int)awardedAmountSum.GetValueOrDefault();
        factDisputeSummary.AwardedPossessions = awardedPossessions.Count;
        factDisputeSummary.Processes = CommonFieldsLoader.GetProcessesCount(UnitOfWork, disputeStatuses.ToList());
        factDisputeSummary.Statuses = disputeUniqueStatusesStagesProcesses;
        factDisputeSummary.Notes = notes.Count;
        factDisputeSummary.Tasks = tasks.Count;
        factDisputeSummary.SentEmailMessages = sentMessagesCount;
        factDisputeSummary.EvidenceOverrides = Utils.GetEvidenceOverridesOnCount(disputeStatuses.ToList());
        factDisputeSummary.Hearings = disputeHearings.Count;
        factDisputeSummary.CrossHearings = crossDisputeHearings.Count();
        factDisputeSummary.HearingParticipations = hearingParticipations?.Count ?? 0;
        factDisputeSummary.Notices = notices?.Count ?? 0;
        factDisputeSummary.NoticeServices = noticeServices?.Count ?? 0;
        factDisputeSummary.Amendments = amendmentsCount;
        factDisputeSummary.SubServiceRequests = subServices?.Count ?? 0;
        factDisputeSummary.EvidenceFiles = linkedFiles.Count;
        factDisputeSummary.EvidencePackages = evidencePackages?.Count ?? 0;
        factDisputeSummary.EvidencePackageServices = evidencePackageServices?.Count ?? 0;
        factDisputeSummary.EvidenceFilesMb = fileSizesSum;
        factDisputeSummary.DecisionsAndOrders = outcomeDocFiles.Count;
        factDisputeSummary.DecisionsAndOrdersMb = odFileSizesSum;
        factDisputeSummary.DocumentsDelivered = outcomeDocDeliveries.Count;
        factDisputeSummary.TotalOpenTimeMin = totalOpenTimeMin;
        factDisputeSummary.TotalCitizenStatusTimeMin = totalCitizenStatusTime / Utils.SecondsInMinute;
        factDisputeSummary.TotalIoTimeMin = totalIoTimeMin;
        factDisputeSummary.TotalArbTimeMin = totalArbTimeMin;
        factDisputeSummary.SubmittedDateTime = dispute.SubmittedDate;
        factDisputeSummary.InitialPaymentDateTime = dispute.InitialPaymentDate;
        factDisputeSummary.InitialPaymentMethod = (PaymentMethod?)dispute.InitialPaymentMethod;
        factDisputeSummary.Payments = disputeFees.Count;
        factDisputeSummary.Transactions = transactions.Count;
        factDisputeSummary.PaymentsAmount = totalDisputePayment.GetValueOrDefault();
        factDisputeSummary.NoticeDeliveredDateTime = dispute.OriginalNoticeDate;
        factDisputeSummary.LastParticipatoryHearingDateTime = lastHearing?.HearingStartDateTime;
        factDisputeSummary.LastStatusDateTime = lastStatus.StatusStartDate;
        factDisputeSummary.DisputeType = (DisputeType?)dispute.DisputeType;
        factDisputeSummary.DisputeSubType = (DisputeSubType)dispute.DisputeSubType.GetValueOrDefault();
        factDisputeSummary.CreationMethod = (DisputeCreationMethod?)dispute.CreationMethod;
        factDisputeSummary.MigrationSourceOfTruth = dispute.MigrationSourceOfTruth != null ? (MigrationSourceOfTruth?)dispute.MigrationSourceOfTruth : null;
        factDisputeSummary.DisputeUrgency = (DisputeUrgency?)dispute.DisputeUrgency;
        factDisputeSummary.LastStage = (DisputeStage?)lastStatus.Stage;
        factDisputeSummary.LastStatus = (DisputeStatuses)lastStatus.Status;
        factDisputeSummary.LastProcess = (DisputeProcess?)lastStatus.Process;
        factDisputeSummary.SubmittedTimeId = await GetTimeIdAsync(factDisputeSummary.SubmittedDateTime);
        factDisputeSummary.PaymentTimeId = await GetTimeIdAsync(factDisputeSummary.InitialPaymentDateTime);
        factDisputeSummary.NoticeDeliveredTimeId = await GetTimeIdAsync(factDisputeSummary.NoticeDeliveredDateTime);
        factDisputeSummary.LastParticipatoryHearingTimeId = await GetTimeIdAsync(factDisputeSummary.LastParticipatoryHearingDateTime);
        factDisputeSummary.LastStatusTimeId = await GetTimeIdAsync(factDisputeSummary.LastStatusDateTime);
        factDisputeSummary.DisputeCityId = 0;

        factDisputeSummary.DisputeGuid = dispute.DisputeGuid;

        if (dispute.CreatedDate != null)
        {
            factDisputeSummary.CreatedDate = dispute.CreatedDate.Value;
        }

        factDisputeSummary.InitialPaymentMethod = dispute.InitialPaymentMethod.HasValue ? (PaymentMethod)dispute.InitialPaymentMethod : null;
        factDisputeSummary.TenancyEnded = dispute.TenancyEnded == 1;
        factDisputeSummary.AwardedMonetaryIssues = remediesForAwardedMonetaryOrders?.Count() ?? 0;
        factDisputeSummary.RequestedAmount = remediesRequestedAmount;
        factDisputeSummary.EvidenceFilesFromApplicant = applicantsFileIds?.Count() ?? 0;
        factDisputeSummary.EvidenceFilesFromRespondent = respondentsFileIds?.Count() ?? 0;
        factDisputeSummary.EvidencePackagesFromApplicant = applicantFilePackages?.Count ?? 0;
        factDisputeSummary.EvidencePackagesFromRespondent = respondentFilePackages?.Count ?? 0;
        factDisputeSummary.EvidenceFilesMbFromApplicant = applicantFileSizesSum;
        factDisputeSummary.EvidenceFilesMbFromRespondent = respondentFileSizesSum;
        factDisputeSummary.DocumentSets = documentSets?.Count() ?? 0;
        factDisputeSummary.OrdersMonetary = odFilesOrdersMonetary?.Count() ?? 0;
        factDisputeSummary.OrdersPossession = odFilesOrdersPossession?.Count() ?? 0;
        factDisputeSummary.DecisionsInterim = odFilesDecisionsInterim?.Count() ?? 0;
        factDisputeSummary.TotalIoOwners = disputeStatusesOOwners?.Count() ?? 0;
        factDisputeSummary.TotalArbOwners = disputeStatusesArbOwnersCount;
        factDisputeSummary.TotalStage0TimeMin = stage0Time / 60 ?? 0;
        factDisputeSummary.TotalStage2TimeMin = stage2Time / 60 ?? 0;
        factDisputeSummary.TotalStage4TimeMin = stage4Time / 60 ?? 0;
        factDisputeSummary.TotalStage6TimeMin = stage6Time;
        factDisputeSummary.TotalStage8TimeMin = stage8Time;
        factDisputeSummary.TotalStage10TimeMin = stage10Time / 60 ?? 0;
        factDisputeSummary.TotalStatus22TimeMin = status22Time / 60 ?? 0;
        factDisputeSummary.TotalStatus41TimeMin = status41Time / 60 ?? 0;
        factDisputeSummary.TotalStatus102TimeMin = status102Time / 60 ?? 0;
        factDisputeSummary.TotalHearingTimeMin = hearingTime ?? 0;
        factDisputeSummary.TotalHearingPrepTimeMin = hearingPrepTime ?? 0;
        factDisputeSummary.TotalWritingTimeMin = writingTime ?? 0;
        factDisputeSummary.IsAdjourned = isAdjourned ? 1 : 0;
        factDisputeSummary.AvgTaskOpenTimeMin = avgTaskOpenTimeMin.Value;
        factDisputeSummary.AmendRemovedParticipants = amendRemovedParticipants.Count();
        factDisputeSummary.AmendRemovedIssues = amendRemovedIssues.Count();
        factDisputeSummary.TenancyEndDate = tenancyEndDate;
        factDisputeSummary.TenancyUnitType = (int?)tenancyUnitType;
        factDisputeSummary.RequestedReviewConsideration = requestedReviewConsideration?.Count() ?? 0;
        factDisputeSummary.AwardedReviewConsiderations = awardedReviewConsiderations?.Count() ?? 0;
        factDisputeSummary.RequestedClarifications = requestedClarifications?.Count() ?? 0;
        factDisputeSummary.AwardedClarifications = awardedClarifications?.Count() ?? 0;
        factDisputeSummary.RequestedCorrections = requestedCorrections?.Count() ?? 0;
        factDisputeSummary.AwardedCorrections = awardedCorrections?.Count() ?? 0;
        factDisputeSummary.FirstParticipatoryHearingDateTime = firstParticipatoryHearingDateTime;
        factDisputeSummary.FirstParticipatoryHearingDateTimeId = firstParticipatoryHearingDateTimeId;
        factDisputeSummary.DisputeComplexity = (int?)disputeComplexity;
        factDisputeSummary.FirstDecisionDateTime = firstDecisionDateTime;
        factDisputeSummary.FirstDecisionDateTimeId = firstDecisionDateTimeId;

        LogInformation("All fields are assigned");

        return factDisputeSummary;
    }
}