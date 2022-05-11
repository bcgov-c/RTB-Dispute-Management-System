using System;
using System.Linq;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.WorkflowReports;

public class WorkflowReportsRepository : IWorkflowReportsRepository
{
    private readonly CaseManagementContext _context;

    public WorkflowReportsRepository(CaseManagementContext context)
    {
        _context = context;
    }

    public async Task<int> GetFutureHearingsCount(Guid disputeGuid)
    {
        var result = from disputeHearing in _context.DisputeHearings
            join hearing in _context.Hearings
                on disputeHearing.HearingId equals hearing.HearingId
            where hearing.LocalStartDateTime > DateTime.Now &&
                  disputeHearing.IsDeleted != true &&
                  disputeHearing.DisputeGuid == disputeGuid
            select disputeHearing;
        var disputeHearings = await result.ToListAsync();

        return disputeHearings.Count;
    }

    public async Task<int> GetIncompleteTasksCount(Guid disputeGuid)
    {
        var incompleteTasks = await _context.Tasks
            .Where(t => t.TaskStatus == (byte)TasksStatus.Incomplete && t.DisputeGuid == disputeGuid)
            .ToListAsync();

        return incompleteTasks.Count;
    }

    public async Task<int> GetIncompleteOutcomeDocumentsCount(Guid disputeGuid)
    {
        var incompleteDocuments = await _context.OutcomeDocFiles
            .Where(o => o.FileId == null && o.DisputeGuid == disputeGuid)
            .ToListAsync();

        return incompleteDocuments.Count;
    }

    public Task<int> GetNotReadyToSendDocumentsCount(Guid disputeGuid)
    {
        throw new NotImplementedException();
    }

    public async Task<int> GetUndeliveredDocumentsCount(Guid disputeGuid)
    {
        var undeliveredDocuments = await _context.OutcomeDocDeliveries
            .Where(o => o.ReadyForDelivery == true && o.IsDelivered != true && o.DisputeGuid == disputeGuid)
            .ToListAsync();

        return undeliveredDocuments.Count;
    }

    public async Task<int> GetMissingIssueOutcomesCount(Guid disputeGuid)
    {
        var claimIds = from claim in _context.Claims
            join claimGroup in _context.ClaimGroups on claim.ClaimGroupId equals claimGroup.ClaimGroupId
            where claimGroup.DisputeGuid == disputeGuid && claim.IsDeleted != true && claimGroup.IsDeleted != true &&
                  (claim.ClaimStatus != (byte)ClaimStatus.Removed && claim.ClaimStatus != (byte)ClaimStatus.Deleted)
            select claim.ClaimId;

        var remedies = await _context.Remedies
            .Where(r => claimIds.Contains(r.ClaimId)
                        && (r.RemedyStatus == null || r.RemedyStatus == (byte)RemedyStatus.NotSet || r.RemedyStatus == (byte)RemedyStatus.NotDecided))
            .ToListAsync();

        return remedies.Count;
    }

    public async Task<int> GetMissingHearingParticipationsCount(Guid disputeGuid)
    {
        var hearingIds = await _context.DisputeHearings
            .Where(d => d.DisputeGuid == disputeGuid)
            .Select(d => d.HearingId)
            .ToListAsync();

        var missingHearingParticipations = await _context.HearingParticipations.Include(x => x.Participant)
            .Where(h => h.ParticipationStatus == null && h.DisputeGuid == disputeGuid && hearingIds.Contains(h.HearingId)
                        && h.Participant.ParticipantStatus != (byte)ParticipantStatus.Removed
                        && h.Participant.ParticipantStatus != (byte)ParticipantStatus.Deleted)
            .ToListAsync();

        return missingHearingParticipations.Count;
    }

    public async Task<int> GetMissingNoticeServiceCount(Guid disputeGuid)
    {
        var noticeIds = await _context.Notices
            .Include(x => x.Participant)
            .Where(x => x.DisputeGuid == disputeGuid && x.IsDeleted != true
                                                     && x.Participant.ParticipantStatus != (byte)ParticipantStatus.Removed
                                                     && x.Participant.ParticipantStatus != (byte)ParticipantStatus.Deleted)
            .Select(x => x.NoticeId)
            .ToListAsync();

        var missingNoticeServices = await _context.NoticeServices
            .Where(n => noticeIds.Contains(n.NoticeId) && n.IsServed == null)
            .ToListAsync();

        return missingNoticeServices.Count;
    }

    public async Task<int> GetMissingHearingDetailsCount(Guid disputeGuid)
    {
        var disputeHearings = await _context
            .DisputeHearings
            .Where(x => x.DisputeGuid == disputeGuid)
            .Select(x => x.HearingId)
            .Distinct()
            .ToListAsync();

        var hearingsCount = await _context
            .Hearings
            .Where(x => disputeHearings.Contains(x.HearingId) && (x.HearingDuration == null || x.HearingMethod == null || x.HearingPrepTime == null)).CountAsync();

        return hearingsCount;
    }

    public async Task<int> GetMissingDocumentWritingTimeCount(Guid disputeGuid)
    {
        var missingDocumentWritingCount = await _context
            .OutcomeDocGroups
            .Where(x => x.DocWritingTime == null && x.DisputeGuid == disputeGuid)
            .CountAsync();

        return missingDocumentWritingCount;
    }

    public async Task<int> GetIncompleteDocumentRequestsCount(Guid disputeGuid)
    {
        var incompleteOutcomeDocRequestsCount = await _context
            .OutcomeDocRequests
            .Where(x => x.DisputeGuid == disputeGuid
                        && x.RequestStatus != 5
                        && (x.RequestStatus == 0 || x.OutcomeDocReqItems.Any(ri => ri.ItemStatus == 0)))
            .CountAsync();

        return incompleteOutcomeDocRequestsCount;
    }

    public async Task<int> GetNotReadyDeliveredDocuments(Guid disputeGuid)
    {
        var outcomeDocDeliveries = await _context
            .OutcomeDocDeliveries
            .Where(x => x.DisputeGuid == disputeGuid && x.IsDelivered == false && x.ReadyForDelivery != true)
            .CountAsync();

        return outcomeDocDeliveries;
    }

    public async Task<bool> GetMissingDisputeNotice(Guid disputeGuid)
    {
        var missingDisputeNoticesCount = await _context
            .Notices
            .Where(x => x.DisputeGuid == disputeGuid
                        && (x.NoticeType == (byte)NoticeTypes.GeneratedDisputeNotice
                            || x.NoticeType == (byte)NoticeTypes.UploadedDisputeNotice
                            || x.NoticeType == (byte)NoticeTypes.UploadedOtherNotice))
            .CountAsync();
        return missingDisputeNoticesCount == 0;
    }

    public async Task<int> GetIncompleteSubServiceRequests(Guid disputeGuid)
    {
        var incompleteSubServiceRequests = await _context
            .SubstitutedServices
            .Where(x => x.DisputeGuid == disputeGuid
                        && x.RequestStatus != 3
                        && x.RequestStatus != 4
                        && x.RequestStatus != 5)
            .CountAsync();

        return incompleteSubServiceRequests;
    }

    public async Task<int> GetNoticeNotProvided(Guid disputeGuid)
    {
        var noticeNotProvided = await _context
            .Notices
            .Where(x => x.DisputeGuid == disputeGuid
                        && (!x.NoticeDeliveryMethod.HasValue
                            || x.NoticeDeliveryMethod == 0))
            .CountAsync();

        return noticeNotProvided;
    }

    public async Task<int> GetEmailWithErrors(Guid disputeGuid)
    {
        var emailWithErrors = await _context
            .EmailMessages
            .Where(x => x.DisputeGuid == disputeGuid
                        && x.SendStatus == (byte?)EmailStatus.Error)
            .CountAsync();

        return emailWithErrors;
    }

    public async Task<int> GetUnpaidFees(Guid disputeGuid)
    {
        var unpaidFees = await _context
            .DisputeFees
            .Where(x => x.DisputeGuid == disputeGuid
                        && x.IsPaid != true)
            .CountAsync();

        return unpaidFees;
    }

    public async Task<bool> GetEvidenceOverrideOn(Guid disputeGuid)
    {
        var status = await _context
            .DisputeStatuses
            .FirstOrDefaultAsync(x => x.DisputeGuid == disputeGuid && x.IsActive == true);

        return status.EvidenceOverride.HasValue && status.EvidenceOverride != 0;
    }

    public async Task<bool> GetMissingKeyFileInfo(Guid disputeGuid)
    {
        var claimGroups = await _context
            .ClaimGroups
            .Where(x => x.DisputeGuid == disputeGuid).Select(x => x.ClaimGroupId)
            ?.ToListAsync();
        var anyClaims = await _context
            .Claims
            .AnyAsync(x => (x.ClaimStatus != (byte?)ClaimStatus.Removed || x.ClaimStatus != (byte?)ClaimStatus.Removed)
                        && claimGroups.Contains(x.ClaimGroupId));

        var participants = await _context
            .ClaimGroupParticipants
            .Where(x => x.DisputeGuid == disputeGuid && x.GroupParticipantRole == (byte?)GroupParticipantRole.Respondent)
            .Select(x => x.ParticipantId)
            ?.ToListAsync();
        var anyActiveRespondents = await _context
            .Participants
            .AnyAsync(x => (x.ParticipantStatus != (byte)ParticipantStatus.Removed || x.ParticipantStatus != (byte)ParticipantStatus.Deleted)
                            && participants.Contains(x.ParticipantId));

        var claimGroupParticipants = await _context
            .ClaimGroupParticipants
            .Where(x => x.DisputeGuid == disputeGuid && x.GroupParticipantRole == (byte?)GroupParticipantRole.Applicant)
            .Select(x => x.GroupPrimaryContactId)
            .Distinct()
            ?.ToListAsync();
        var addressesLengths = await _context
            .Participants
            .Where(x => claimGroupParticipants.Contains(x.ParticipantId))
            .Select(x => x.Address)
            ?.ToListAsync();

        var result = anyClaims && anyActiveRespondents && addressesLengths.Any(x => x != null && x.Length > 0);

        return !result;
    }

    public async Task<int> GetDocumentsMissingDeliveries(Guid disputeGuid)
    {
        var outcomeDocFileIds = await _context
            .OutcomeDocDeliveries
            .Where(x => x.DisputeGuid == disputeGuid)
            ?.Select(x => x.OutcomeDocFileId)
            .ToListAsync();

        var outcomeDocFilesCount = await _context
            .OutcomeDocFiles
            .CountAsync(x => x.DisputeGuid == disputeGuid
                    && (x.FileType != (byte)OutcomeDocFileTypes.PublicDecision && x.FileType != (byte)OutcomeDocFileTypes.ExternalWorkingDocument)
                    && !outcomeDocFileIds.Contains(x.OutcomeDocFileId));

        return outcomeDocFilesCount;
    }

    public async Task<int> GetMissingEvidenceService(Guid disputeGuid)
    {
        var filePackagesId = await _context
            .FilePackages
            .Where(x => x.DisputeGuid == disputeGuid)
            .Select(x => x.FilePackageId)
            .ToListAsync();

        var filePackageServicesCount = await _context
            .FilePackageServices
            .CountAsync(x => x.IsServed == null && filePackagesId.Contains(x.FilePackageId));

        return filePackageServicesCount;
    }
}