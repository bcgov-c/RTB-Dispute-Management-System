using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;
using CM.Messages.PostedDecision.Events;
using CM.Messages.PostedDecisionDataCollector.Events;
using CM.Messages.Validation;
using CM.ServiceBase;
using EasyNetQ;
using EasyNetQ.AutoSubscribe;
using Serilog;
using UglyToad.PdfPig;

namespace CM.Services.PostedDecisionDataCollector.PostedDecisionDataCollectorService.IntegrationEvents.EventHandling;

public class PostedDecisionDataCollectorEventHandler : IConsumeAsync<PostedDecisionDataCollectionEvent>
{
    private readonly IBus _bus;

    private readonly ILogger _logger;
    private readonly IUnitOfWork _unitOfWork;

    public PostedDecisionDataCollectorEventHandler(IUnitOfWork unitOfWork, IBus bus, ILogger logger)
    {
        _unitOfWork = unitOfWork;
        _bus = bus;
        _logger = logger;
    }

    [AutoSubscriberConsumer(SubscriptionId = "PostedDecisionDataCollector")]
    public async Task ConsumeAsync(PostedDecisionDataCollectionEvent message, CancellationToken cancellationToken = default)
    {
        message.Validate();
        var log = _logger.ForContext("CorrelationGuid", message.CorrelationGuid);
        log.EventMessage("Posted Decision Data Collection Event Received", message);

        var disputeGuid = message.DisputeGuid;
        var dispute = await _unitOfWork.DisputeRepository.GetDisputeByGuidAsync(disputeGuid);

        if (dispute != null)
        {
            var lastDisputeStatus = await _unitOfWork.DisputeStatusRepository.GetDisputeLastStatusAsync(disputeGuid);
            var participants = await _unitOfWork.ParticipantRepository.GetDisputeActiveParticipantsAsync(dispute.DisputeGuid);
            var individualsCount = participants.Count(p => p.ParticipantType == (byte)ParticipantType.Individual);
            var agentsCount = participants.Count(p => p.ParticipantType == (byte)ParticipantType.AgentOrLawyer);
            var businessesCount = participants.Count(p => p.ParticipantType == (byte)ParticipantType.Business);
            var advocatesCount = participants.Count(p => p.ParticipantType == (byte)ParticipantType.AdvocateOrAssistant);
            var applicants = await _unitOfWork.ParticipantRepository.GetActiveApplicantsAsync(disputeGuid);
            var applicantIds = await applicants.Select(a => a.ParticipantId).ToListAsync();
            var respondents = await _unitOfWork.ParticipantRepository.GetActiveRespondentsAsync(disputeGuid);
            var respondentIds = await respondents.Select(r => r.ParticipantId).ToListAsync();
            var primaryApplicant = await _unitOfWork.ParticipantRepository.GetPrimaryApplicantAsync(disputeGuid);
            var disputeProcessDetail = await _unitOfWork.DisputeProcessDetailRepository.GetLastDisputeProcessDetail(disputeGuid);
            var disputeFiles = await _unitOfWork.FileRepository.GetDisputeFiles(disputeGuid);
            var outcomeDocumentFiles = await _unitOfWork.OutcomeDocFileRepository.GetDisputeOutcomeDocFiles(disputeGuid);
            var latestHearing = await _unitOfWork.HearingRepository.GetLastHearing(disputeGuid);
            var partiesBusinessNames = participants.Where(x => x.ParticipantType == (byte?)ParticipantType.Business &&
                                                               (x.ParticipantStatus != (byte)ParticipantStatus.Removed && x.ParticipantStatus != (byte)ParticipantStatus.Deleted))
                .Select(x => x.BusinessName).ToList();
            var outcomeDocFile = await _unitOfWork.OutcomeDocFileRepository.GetByIdAsync(message.OutcomeDocFileId);

            string searchText;
            try
            {
                searchText = await GetPdfText(message.FileGuid);
            }
            catch (Exception e)
            {
                outcomeDocFile.FileStatus = FileStatus.Invalid;
                await _unitOfWork.Complete();
                Log.Error(e, "Error while reading pdf file");
                return;
            }

            var postedDecisionEvent = new PostedDecisionDataProcessingEvent
            {
                DisputeId = dispute.DisputeId,
                DecisionDate = DateTime.UtcNow,
                DecisionFileId = message.OutcomeDocFileId,
                CreatedMethod = dispute.CreationMethod,
                InitialPaymentMethod = dispute.InitialPaymentMethod,
                DisputeType = dispute.DisputeType,
                DisputeSubType = dispute.DisputeSubType,
                DisputeProcess = lastDisputeStatus?.Process,
                DisputeUrgency = dispute.DisputeUrgency,
                TenancyCity = dispute.TenancyCity,
                TenancyEnded = dispute.TenancyEnded,
                TenancyEndDate = dispute.TenancyEndDate,
                TenancyStartDate = dispute.TenancyStartDate,
                TenancyGeozone = dispute.TenancyGeozoneId,
                ApplicationSubmittedDate = dispute.SubmittedDate,
                OriginalNoticeDate = dispute.OriginalNoticeDate,
                OriginalNoticeDelivered = dispute.OriginalNoticeDelivered,
                TenancyAgreementSignedBy = dispute.TenancyAgreementSignedBy,
                RentPaymentAmount = dispute.RentPaymentAmount,
                RentPaymentInterval = dispute.RentPaymentInterval,
                SecurityDepositAmount = dispute.SecurityDepositAmount,
                PetDamageDepositAmount = dispute.PetDamageDepositAmount,
                NumberIndividuals = (byte)individualsCount,
                NumberAgents = (byte)agentsCount,
                NumberBusinesses = (byte)businessesCount,
                NumberAdvocates = (byte)advocatesCount,
                NumberApplicants = (byte)applicants.Count,
                NumberRespondents = (byte)respondents.Count,
                PrimaryApplicantType = primaryApplicant?.ParticipantType,
                PostedBy = message.PostedBy,
                FileNumber = dispute.FileNumber ?? dispute.FileNumber.Value,
                FilePath = message.FileGuid.ToString(),
                BusinessNames = partiesBusinessNames.CreateString(","),
                AnonDecisionId = "AnonDec-" + message.OutcomeDocFileId + ".pdf",
                NoteWorthy = outcomeDocFile.NoteWorthy,
                MateriallyDifferent = outcomeDocFile.MateriallyDifferent,
                SearchText = searchText
            };

            var hearingParticipations = new List<Data.Model.HearingParticipation>();

            if (latestHearing != null)
            {
                var disputeHearings = await _unitOfWork.DisputeHearingRepository.GetByHearingId(latestHearing.HearingId);

                if (disputeHearings.Any())
                {
                    postedDecisionEvent.PreviousHearingLinkingType = disputeHearings.OrderByDescending(d => d.DisputeHearingId).LastOrDefault().SharedHearingLinkType;
                }

                hearingParticipations = await _unitOfWork.HearingParticipationRepository.GetHearingParticipationsAsync(latestHearing.HearingId, ParticipationStatus.Participated);

                var claimGroupApplicants = await _unitOfWork.ClaimGroupParticipantRepository
                    .FindAllAsync(x => x.DisputeGuid == dispute.DisputeGuid && x.GroupParticipantRole == (byte)ParticipantRole.Applicant);
                var claimGroupApplicantIds = claimGroupApplicants.Select(x => x.ParticipantId).ToList();

                var hearingApplicants = hearingParticipations.Where(x => x.ParticipantId != null && claimGroupApplicantIds.Contains(x.ParticipantId.Value)).ToList();
                var hearingOtherApplicants = hearingParticipations.Where(x => x.ParticipantId == null && x.OtherParticipantAssociation == (byte)ParticipantRole.Applicant).ToList();

                postedDecisionEvent.ApplicantHearingAttendance = (byte)(hearingApplicants.Count + hearingOtherApplicants.Count);

                var claimGroupRespondents = await _unitOfWork.ClaimGroupParticipantRepository
                    .FindAllAsync(x => x.DisputeGuid == dispute.DisputeGuid && x.GroupParticipantRole == (byte)ParticipantRole.Respondent);
                var claimGroupRespondentIds = claimGroupRespondents.Select(x => x.ParticipantId).ToList();

                var hearingRespondents = hearingParticipations.Where(x => x.ParticipantId != null && claimGroupRespondentIds.Contains(x.ParticipantId.Value)).ToList();
                var hearingOtherRespondents = hearingParticipations.Where(x => x.ParticipantId == null && x.OtherParticipantAssociation == (byte)ParticipantRole.Respondent).ToList();
                postedDecisionEvent.RespondentHearingAttendance = (byte)(hearingOtherRespondents.Count + hearingRespondents.Count);

                postedDecisionEvent.PreviousHearingDate = latestHearing.LocalStartDateTime;
            }

            var countApplicantEvidenceFiles = 0;
            var countRespondentEvidenceFiles = 0;

            foreach (var disputeFile in disputeFiles)
            {
                if (disputeFile.AddedBy != null && applicantIds.Contains((int)disputeFile.AddedBy))
                {
                    countApplicantEvidenceFiles++;
                }

                if (disputeFile.AddedBy != null && respondentIds.Contains((int)disputeFile.AddedBy))
                {
                    countRespondentEvidenceFiles++;
                }
            }

            postedDecisionEvent.CountApplicantEvidenceFiles = countApplicantEvidenceFiles;
            postedDecisionEvent.CountRespondentEvidenceFiles = countRespondentEvidenceFiles;

            if (disputeProcessDetail != null)
            {
                postedDecisionEvent.PreviousHearingProcessDuration = disputeProcessDetail.ProcessDuration;
                postedDecisionEvent.PreviousHearingProcessMethod = disputeProcessDetail.ProcessMethod;
                postedDecisionEvent.AssociateProcessId = disputeProcessDetail.AssociatedProcess;
                postedDecisionEvent.AssociatedProcessName = null;
            }

            if (outcomeDocumentFiles.Any())
            {
                postedDecisionEvent.PostingDate = outcomeDocumentFiles.OrderByDescending(o => o.OutcomeDocFileId).LastOrDefault().ModifiedDate;
            }

            var claims = await _unitOfWork.ClaimRepository.GetDisputeClaimsWithChildren(disputeGuid);

            foreach (var claim in claims)
            {
                if (claim != null)
                {
                    var postedDecisionOutcome = new PostedDecisionOutcomeEvent
                    {
                        ClaimId = claim.ClaimId,
                        ClaimTitle = claim.ClaimTitle,
                        ClaimCode = claim.ClaimCode
                    };

                    var remedy = claim.Remedies.FirstOrDefault();

                    if (remedy != null)
                    {
                        var remedyDetails = await _unitOfWork.RemedyDetailRepository.GetByRemedyId(remedy.RemedyId);

                        postedDecisionOutcome.RemedyId = remedy.RemedyId;
                        postedDecisionOutcome.RemedySubStatus = remedy.RemedySubStatus;
                        postedDecisionOutcome.RemedyAmountAwarded = remedy.AwardedAmount;

                        if (remedyDetails != null && remedyDetails.Any())
                        {
                            postedDecisionOutcome.RemedyAmountRequested = remedyDetails.OrderByDescending(r => r.RemedyDetailId).LastOrDefault()?.Amount;
                        }

                        if (remedy.RemedyStatus != null)
                        {
                            postedDecisionOutcome.RemedyStatus = (byte)remedy.RemedyStatus;
                        }

                        if (remedy.RemedyType != null)
                        {
                            postedDecisionOutcome.RemedyType = (byte)remedy.RemedyType;
                        }
                    }

                    var applicantTextType = dispute.DisputeSubType == (byte)DisputeSubType.ApplicantIsLandlord ? "A Landlord" : "A Tenant";
                    var applicantsCount = dispute.DisputeSubType == (byte)DisputeSubType.ApplicantIsLandlord ? $"{applicants.Count} Landlord" : $"{applicants.Count} Tenant";
                    var respondentsCount = dispute.DisputeSubType == (byte)DisputeSubType.ApplicantIsLandlord ? $"{respondents.Count} Tenant" : $"{respondents.Count} Landlord";
                    var actText = dispute.DisputeType == (byte)DisputeType.Rta ? "Residential Tenancy Act" : "Manufactured Home Park Tenancy Act";
                    var hearingAttendeesCount = hearingParticipations.Count > 0 ? hearingParticipations.Count(x => x.ParticipationStatus == (byte)ParticipationStatus.Participated) : 0;
                    var initialPaymentDatePst = dispute.InitialPaymentDate.HasValue ? dispute.InitialPaymentDate.Value.ToString("MMMM dd yyyy") : "(Date not available)";
                    var outcomeDocGroup = await _unitOfWork.OutcomeDocGroupRepository.GetByIdAsync(outcomeDocFile.OutcomeDocGroupId);
                    var associatedDecisionDatePst = outcomeDocGroup.DocCompletedDate.HasValue ? outcomeDocGroup.DocCompletedDate.Value.ToString("MMMM dd yyyy") : "(Date not available)";
                    var searchResultSummary = $"{applicantTextType} dispute for a rental unit occupied in BC with {applicantsCount} participant(s) and {respondentsCount} participant(s). The final hearing was conducted under the {actText} and the latest hearing was attended by {hearingAttendeesCount} attendees. The application for dispute resolution services was filed on {initialPaymentDatePst} with this decision issued on {associatedDecisionDatePst}. See the decision for details.";

                    postedDecisionEvent.SearchResultSummary = searchResultSummary;

                    postedDecisionEvent.PostedDecisionOutcomeEvents.Add(postedDecisionOutcome);
                }
            }

            Publish(postedDecisionEvent);
        }
    }

    private void Publish(PostedDecisionDataProcessingEvent message)
    {
        _bus.PubSub.PublishAsync(message).ContinueWith(task =>
        {
            if (task.IsCompleted)
            {
                Log.Information("Publish posted decision data processing event");
            }

            if (task.IsFaulted)
            {
                Log.Error(task.Exception, "Publish posted decision data processing event");
            }
        });
    }

    private async Task<string> GetPdfText(Guid fileGuid)
    {
        var sb = new StringBuilder();

        var file = await _unitOfWork.FileRepository.GetNoTrackingByIdAsync(f => f.FileGuid == fileGuid);
        if (file != null)
        {
            var fileAbsolutePath = await GetFileAbsolutePath(file);

            if (File.Exists(fileAbsolutePath))
            {
                using var document = PdfDocument.Open(fileAbsolutePath);

                foreach (var page in document.GetPages())
                {
                    sb.Append(page.Text);
                }
            }
        }

        return sb.ToString();
    }

    private async Task<string> GetFileAbsolutePath(CM.Data.Model.File file)
    {
        var systemSettings = file.Storage switch
        {
            StorageType.File => await _unitOfWork.SystemSettingsRepository.GetSetting(SettingKeys.FileStorageRoot),
            StorageType.FileCold => await _unitOfWork.SystemSettingsRepository.GetSetting(SettingKeys.FileColdStorageRoot),
            _ => null
        };

        if (systemSettings != null)
        {
            return Path.Combine(systemSettings.Value, file.FilePath);
        }

        return null;
    }
}