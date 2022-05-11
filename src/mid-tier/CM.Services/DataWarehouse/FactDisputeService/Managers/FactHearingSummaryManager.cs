using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.Services.DataWarehouse.DataWarehouseDataModel.Models;
using CM.Services.DataWarehouse.DataWarehouseRepository.UnitOfWork;
using CM.Services.DataWarehouse.FactDisputeService.Common;
using CM.Services.DataWarehouse.FactDisputeService.Helper;
using Serilog;
using Task = System.Threading.Tasks.Task;

namespace CM.Services.DataWarehouse.FactDisputeService.Managers;

public class FactHearingSummaryManager : StatisticManagerBase
{
    public FactHearingSummaryManager(IUnitOfWork unitOfWork, IUnitOfWorkDataWarehouse dwUnitOfWork, ILogger logger)
        : base(unitOfWork, dwUnitOfWork, logger)
    {
    }

    public async Task Record(int dateDelay)
    {
        var loadingEventId = await LoadingHistoryManager.InsertLoadingHistory(FactTable.FHearingSummary);

        var excludedHearings = await DwUnitOfWork.FactHearingSummaryRepository.GetExistedHearings();
        var hearings = await UnitOfWork.HearingRepository.GetFactHearings(excludedHearings, dateDelay);

        foreach (var hearing in hearings)
        {
            FactHearingSummary factHearingSummary = null;
            try
            {
                factHearingSummary = await GetRecord(hearing);

                await DwUnitOfWork.FactHearingSummaryRepository.InsertAsync(factHearingSummary);
                var res = await DwUnitOfWork.Complete();

                if (res.CheckSuccess())
                {
                    LogInformation("Entity recorded");

                    await LoadingHistoryManager.UpdateLoadingHistory(loadingEventId, LoadingHistoryStatus.LoadComplete, string.Empty, res);
                }
                else
                {
                    LogInformation("Insert is failed");
                    await LoadingHistoryManager.UpdateLoadingHistory(loadingEventId, LoadingHistoryStatus.Failed, "FactHearingSummary Insert is failed.", 0);
                }
            }
            catch (Exception e)
            {
                if (factHearingSummary != null)
                {
                    var jsonString = JsonSerializer.Serialize(factHearingSummary);
                    LogInformation($"FactHearingSummary Dump = {jsonString}");
                }

                LogError($"Error during record - {hearing.HearingId}", e);
                await LoadingHistoryManager.UpdateLoadingHistory(loadingEventId, LoadingHistoryStatus.Failed, e.Message, 0);
            }
        }
    }

    private async Task<FactHearingSummary> GetRecord(Hearing hearing)
    {
        LogInformation($"Start get record for hearing Id = {hearing.HearingId}");
        var diputeHearings = hearing.DisputeHearings;
        LogInformation($"DiputeHearings count = {diputeHearings.Count}");
        var primaryDisputeHearing = diputeHearings.FirstOrDefault(d => d.DisputeHearingRole == (byte)DisputeHearingRole.Active);
        var secondaryDisputeHearings = diputeHearings.Where(x => x.DisputeGuid.HasValue && x.DisputeHearingRole == (byte)DisputeHearingRole.Secondary).ToList();
        var primaryDispute = primaryDisputeHearing?.Dispute;
        var primaryDisputeGuid = primaryDisputeHearing.DisputeGuid.Value;
        var primaryDisputeStatuses = await UnitOfWork.DisputeStatusRepository.FindAllAsync(x => x.DisputeGuid == primaryDisputeGuid);
        var secondaryDisputeGuids = secondaryDisputeHearings.Select(x => x.DisputeGuid.ToString()).ToList().CreateString(",");
        var hearingParticipations = hearing
            .HearingParticipations
            .Where(x => x.ParticipationStatus == (byte)ParticipationStatus.Participated)
            .ToList();
        LogInformation($"HearingParticipations count = {hearingParticipations.Count}");
        var participants = hearingParticipations
            .Where(x => x.Participant != null)
            .Select(x => x.Participant)
            .Where(x => x.ParticipantStatus != (byte)ParticipantStatus.Deleted
                        && x.ParticipantStatus != (byte)ParticipantStatus.Removed)
            .ToList();
        var participantsId = participants.Select(x => x.ParticipantId).ToList();
        var claimGroupParticipants = await UnitOfWork.ClaimGroupParticipantRepository
            .FindAllAsync(x => participantsId.Contains(x.ParticipantId));
        LogInformation($"ClaimGroupParticipants count = {claimGroupParticipants.Count}");
        var applicants = claimGroupParticipants
            .Where(x => x.GroupParticipantRole == (byte)GroupParticipantRole.Applicant)
            .Select(x => x.ParticipantId).ToList();
        var hearingAttendingApplicants = hearingParticipations
            .Where(x => (x.ParticipantId == null && x.OtherParticipantAssociation == (byte)ParticipantTypes.Applicant)
                        || (x.ParticipantId.HasValue && applicants.Contains(x.ParticipantId.Value)))
            .ToList();
        var respondents = claimGroupParticipants
            .Where(x => x.GroupParticipantRole == (byte)GroupParticipantRole.Respondent)
            .Select(x => x.ParticipantId).ToList();
        var hearingAttendingRespondents = hearingParticipations
            .Where(x => (x.ParticipantId == null && x.OtherParticipantAssociation == (byte?)ParticipantTypes.Respondent)
                        || (respondents.Count > 0 && x.ParticipantId.HasValue && respondents.Contains(x.ParticipantId.Value)))
            .ToList();

        var primaryFactHearings = await CommonFieldsLoader.GetDisputeHearings(UnitOfWork, primaryDisputeGuid);
        var adjournedDisputeStatusExists = CommonFieldsLoader.IsAdjourned(UnitOfWork, primaryDisputeStatuses);

        var primaryPreviousHearingId = await UnitOfWork.DisputeHearingRepository.GetPrimaryPreviousHearingId(hearing.HearingId, primaryDisputeGuid);

        var lastStatus = await CommonFieldsLoader.GetLastStatus(UnitOfWork, primaryDisputeGuid);

        var primaryParticipants = await UnitOfWork
            .ParticipantRepository
            .GetDisputeActiveParticipantsAsync(primaryDisputeGuid);
        var applicantsRespondents = await CommonFieldsLoader.GetApplicantsAndRespondents(UnitOfWork, primaryDisputeGuid);
        LogInformation($"ApplicantsRespondents count = {applicantsRespondents.Count}");
        var primaryApplicants = applicantsRespondents
            .Where(x => x.GroupParticipantRole == (byte)GroupParticipantRole.Applicant)
            .Select(x => x.Participant);
        var primaryRespondents = applicantsRespondents
            .Where(x => x.GroupParticipantRole == (byte)GroupParticipantRole.Respondent)
            .Select(x => x.Participant);
        var primaryTimeSinceInitialPaymentMin = primaryDispute?.InitialPaymentDate.Difference(hearing.HearingStartDateTime);
        var primaryTimeSinceSubmittedMin = primaryDispute?.SubmittedDate.Difference(hearing.HearingStartDateTime);

        var primaryProcessesCount = CommonFieldsLoader.GetProcessesCount(UnitOfWork, primaryDisputeStatuses.ToList());
        var primaryStatusesCount = await CommonFieldsLoader.GetUniqueStatusesCount(UnitOfWork, primaryDisputeGuid);
        var primarySentEmailMessagesCount = await CommonFieldsLoader.GetSentEmailMessagesCount(UnitOfWork, primaryDisputeGuid);
        var primaryAmendmentsCount = await CommonFieldsLoader.GetAmendmentsCount(UnitOfWork, primaryDisputeGuid);
        var primarySubServiceRequests = await UnitOfWork.SubstitutedServiceRepository
            .FindAllAsync(x => x.DisputeGuid == primaryDisputeGuid);
        var primaryTotalArbTimeMin = Utils.GetStatusesTotalArbTime(primaryDisputeStatuses.ToList());
        var primaryTotalArbOwnersCount = await CommonFieldsLoader.GetTotalArbOwnersCount(UnitOfWork, primaryDisputeStatuses.ToList());
        var primaryTotalStage6TimeMin = CommonFieldsLoader.GetTotalStage6TimeMin(UnitOfWork, primaryDisputeStatuses.ToList());
        var primaryTotalStage8TimeMin = CommonFieldsLoader.GetTotalStage8TimeMin(UnitOfWork, primaryDisputeStatuses.ToList());

        var hearingAllDisputes = diputeHearings.Select(x => x.DisputeGuid).ToList();
        var allLinkedEvidenceFiles = await CommonFieldsLoader.GetLinkedEvidenceFiles(UnitOfWork, hearingAllDisputes);
        LogInformation($"AllLinkedEvidenceFiles count = {allLinkedEvidenceFiles.Count}");
        var fileIds = allLinkedEvidenceFiles.Select(x => x.FileId);
        var associatedFiles = await UnitOfWork.FileRepository.FindAllAsync(x => fileIds.Contains(x.FileId));
        var allLinkedEvidenceFilesMb = CommonFieldsLoader.GetLinkedEvidenceFilesMb(UnitOfWork, allLinkedEvidenceFiles, associatedFiles);
        var allLinkedIssues = await CommonFieldsLoader.GetDisputesClaims(UnitOfWork, hearingAllDisputes);
        var allLinkedIssueCodes = allLinkedIssues.Select(x => x.ClaimCode).ToArray();
        var allLinkedIssueCodesString = allLinkedIssueCodes.CreateString(",");
        var allLinkedRequestedAmount = await CommonFieldsLoader.GetLinkedRequestedAmount(UnitOfWork, allLinkedIssues.Select(x => x.ClaimId));
        var primarySubmittedTimeId = await GetTimeIdAsync(primaryDispute?.SubmittedDate);
        var primaryInitialPaymentTimeId = await GetTimeIdAsync(primaryDispute?.InitialPaymentDate);
        var hearingStartDateTimeId = await GetTimeIdAsync(hearing.HearingStartDateTime);

        var factHearingSummary = new FactHearingSummary
        {
            LoadDateTime = DateTime.UtcNow,
            AssociatedOffice = (int)Offices.Rtbbc,
            IsActive = true,
            IsPublic = false,
            HearingId = hearing.HearingId,
            DisputeGuid = primaryDisputeGuid,
            SharedHearingLinkingType = primaryDisputeHearing.SharedHearingLinkType,
            LinkedDisputes = (byte?)hearing.DisputeHearings.Count,
            SecondaryDisputeGuids = secondaryDisputeGuids,
            LocalHearingStartDateTime = hearing.LocalStartDateTime,
            LocalHearingEndDateTime = hearing.LocalEndDateTime,
            HearingStartDateTime = hearing.HearingStartDateTime,
            HearingEndDateTime = hearing.HearingEndDateTime,
            HearingOwner = hearing.HearingOwner,
            HearingPriority = hearing.HearingPriority,
            HearingDuration = hearing.HearingDuration,
            HearingMethod = hearing.HearingMethod,
            HearingType = hearing.HearingType,
            HearingParticipations = hearingParticipations.Count(),
            HearingAttendingApplicants = hearingAttendingApplicants.Count(),
            HearingAttendingRespondents = hearingAttendingRespondents.Count(),
            PrimaryHearings = primaryFactHearings.Count(),
            PrimaryAdjourned = adjournedDisputeStatusExists,
            PrimaryPreviousHearingId = primaryPreviousHearingId,
            PrimaryLastProcess = lastStatus.Process,
            PrimaryLastStage = lastStatus.Stage,
            PrimaryLastStatus = lastStatus.Status,
            PrimaryDisputeType = primaryDispute.DisputeType,
            PrimaryDisputeSubType = primaryDispute.DisputeSubType,
            PrimaryTenancyUnitType = (int?)primaryDispute.TenancyUnitType,
            PrimaryCreationMethod = primaryDispute.CreationMethod,
            PrimaryTenancyEnded = primaryDispute.TenancyEnded != 0,
            PrimaryTenancyEndDateTime = primaryDispute.TenancyEndDate,
            PrimaryDisputeUrgency = primaryDispute.DisputeUrgency,
            PrimarySubmittedDateTime = primaryDispute.SubmittedDate,
            PrimaryInitialPaymentDateTime = primaryDispute.InitialPaymentDate,
            PrimaryParticipants = primaryParticipants.Count(),
            PrimaryApplicants = primaryApplicants.Count(),
            PrimaryRespondents = primaryRespondents.Count(),
            PrimaryTimeSinceInitialPaymentMin = (int?)primaryTimeSinceInitialPaymentMin,
            PrimaryTimeSinceSubmittedMin = (int?)primaryTimeSinceSubmittedMin,
            PrimaryProcesses = primaryProcessesCount,
            PrimaryStatuses = primaryStatusesCount,
            PrimarySentEmailMessages = primarySentEmailMessagesCount,
            PrimaryAmendments = primaryAmendmentsCount,
            PrimarySubServiceRequests = primarySubServiceRequests.Count(),
            PrimaryTotalArbTimeMin = primaryTotalArbTimeMin,
            PrimaryTotalArbOwners = primaryTotalArbOwnersCount,
            PrimaryTotalStage6TimeMin = primaryTotalStage6TimeMin,
            PrimaryTotalStage8TimeMin = primaryTotalStage8TimeMin,
            AllLinkedEvidenceFiles = allLinkedEvidenceFiles.Count(),
            AllLinkedEvidenceFilesMb = allLinkedEvidenceFilesMb,
            AllLinkedIssues = allLinkedIssues.Count(),
            AllLinkedIssueCodes = allLinkedIssueCodesString,
            AllLinkedRequestedAmount = allLinkedRequestedAmount,
            PrimarySubmittedTimeId = primarySubmittedTimeId,
            PrimaryInitialPaymentTimeId = primaryInitialPaymentTimeId,
            HearingStartDateTimeId = hearingStartDateTimeId,
            HearingPrepTime = hearing.HearingPrepTime
        };

        return factHearingSummary;
    }
}