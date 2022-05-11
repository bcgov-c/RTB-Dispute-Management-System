using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.Services.DataWarehouse.FactDisputeService.Helper;

namespace CM.Services.DataWarehouse.FactDisputeService.Common;

public static class CommonFieldsLoader
{
    public static async Task<List<LinkedFile>> GetLinkedEvidenceFiles(IUnitOfWork unitOfWork, List<Guid?> disputeGuids)
    {
        var fileDescriptions = await unitOfWork.FileDescriptionRepository.FindAllAsync(x => disputeGuids.Contains(x.DisputeGuid)
            && (x.DescriptionCategory == (byte)FileDescriptionCategories.OtherEvidenceNotAssociatedToClaims
                || x.DescriptionCategory == (byte)FileDescriptionCategories.OtherEvidenceAssociatedToClaims
                || x.DescriptionCategory == (byte)FileDescriptionCategories.Nine
                || x.DescriptionCode == (byte)FileDescriptionCodes.MonetaryOrderWorksheet
                || x.DescriptionCode == (byte)FileDescriptionCodes.TenancyAgreement));
        var fileDescIds = fileDescriptions.Select(x => x.FileDescriptionId);
        var linkedEvidenceFiles = await unitOfWork.LinkedFileRepository
            .FindAllAsync(x => disputeGuids.Contains(x.DisputeGuid) && fileDescIds.Contains(x.FileDescriptionId));

        return linkedEvidenceFiles.ToList();
    }

    public static decimal GetLinkedEvidenceFilesMb(IUnitOfWork unitOfWork, List<LinkedFile> linkedFiles, ICollection<File> associatedFiles)
    {
        var linkedEvidenceFilesMb = associatedFiles != null ?
            Utils.ConvertBytesToMegabytes(associatedFiles.Sum(x => x.FileSize)) : 0;
        return linkedEvidenceFilesMb;
    }

    public static async Task<List<Claim>> GetDisputesClaims(IUnitOfWork unitOfWork, List<Guid?> disputeGuids)
    {
        var claimGroups = await unitOfWork.ClaimGroupRepository.FindAllAsync(x => disputeGuids.Contains(x.DisputeGuid));
        var claimGroupIds = claimGroups.Select(x => x.ClaimGroupId);
        var allClaims = await unitOfWork.ClaimRepository.FindAllAsync(x => claimGroupIds.Contains(x.ClaimGroupId));
        var claims = allClaims.Where(x => x.ClaimStatus != (byte)ClaimStatus.Removed && x.ClaimStatus != (byte)ClaimStatus.Deleted).ToList();

        return claims;
    }

    public static async Task<int> GetLinkedRequestedAmount(IUnitOfWork unitOfWork, IEnumerable<int> claimIds)
    {
        var remediesForRequested = await unitOfWork.RemedyRepository.FindAllAsync(x => claimIds.Contains(x.ClaimId));
        var remediesId = remediesForRequested.Select(x => x.RemedyId);
        var remediesRequestedAmount = await unitOfWork.RemedyDetailRepository.FindAllAsync(x => remediesId.Contains(x.RemedyId));
        var sum = remediesRequestedAmount.Sum(x => x.Amount);

        return (int)sum.GetValueOrDefault();
    }

    public static async Task<List<DisputeHearing>> GetDisputeHearings(IUnitOfWork unitOfWork, Guid disputeGuid)
    {
        var disputeHearings = await unitOfWork.DisputeHearingRepository.GetDisputeHearings(disputeGuid);

        return disputeHearings;
    }

    public static bool IsAdjourned(IUnitOfWork unitOfWork, ICollection<DisputeStatus> disputeStatuses)
    {
        var isAdjourned = disputeStatuses.Any(x => x.Status == (byte)DisputeStatuses.Adjourned);

        return isAdjourned;
    }

    public static async Task<DisputeStatus> GetLastStatus(IUnitOfWork unitOfWork, Guid disputeGuid)
    {
        var lastStatus = await unitOfWork.DisputeStatusRepository.GetDisputeLastStatusAsync(disputeGuid);

        return lastStatus;
    }

    public static async Task<ICollection<ClaimGroupParticipant>> GetApplicantsAndRespondents(IUnitOfWork unitOfWork, Guid disputeGuid)
    {
        var participants = await unitOfWork
            .ClaimGroupParticipantRepository
            .FindAllAsync(x => x.DisputeGuid == disputeGuid
                               && (x.Participant.ParticipantStatus != (byte)ParticipantStatus.Removed && x.Participant.ParticipantStatus != (byte)ParticipantStatus.Deleted)
                               && (x.GroupParticipantRole == (byte)GroupParticipantRole.Applicant || x.GroupParticipantRole == (byte)GroupParticipantRole.Respondent));

        return participants;
    }

    public static int GetProcessesCount(IUnitOfWork unitOfWork, List<DisputeStatus> disputeStatuses)
    {
        var processesCount = disputeStatuses
            .Where(x => x.Process != null)
            .DistinctBy(x => x.Process)
            .Count();
        return processesCount;
    }

    public static async Task<int> GetUniqueStatusesCount(IUnitOfWork unitOfWork, Guid disputeGuid)
    {
        var statuses = await unitOfWork
            .DisputeStatusRepository
            .GetUniqueStatuses(disputeGuid);

        return statuses?.Count ?? 0;
    }

    public static async Task<int> GetSentEmailMessagesCount(IUnitOfWork unitOfWork, Guid disputeGuid)
    {
        var sentMessages = await unitOfWork.EmailMessageRepository
            .FindAllAsync(x => x.SendStatus == (byte)EmailStatus.Sent && x.DisputeGuid == disputeGuid);
        return sentMessages?.Count ?? 0;
    }

    public static async Task<int> GetAmendmentsCount(IUnitOfWork unitOfWork, Guid disputeGuid)
    {
        if (disputeGuid.ToString() == "c46f4c0b-3520-4f94-ae67-e7e2763eddff")
        {
        }

        var amendments = await unitOfWork.NoticeRepository
            .FindAllAsync(x => x.DisputeGuid == disputeGuid
                               && (x.NoticeType == (byte)NoticeTypes.GeneratedAmendmentNotice
                                   || x.NoticeType == (byte)NoticeTypes.UploadedAmendmentNotice));
        return amendments?.Count ?? 0;
    }

    public static async Task<int> GetTotalArbOwnersCount(IUnitOfWork unitOfWork, List<DisputeStatus> disputeStatuses)
    {
        var internalUserRoles2 = await unitOfWork.InternalUserRoleRepository
            .FindAllAsync(x => x.RoleGroupId == (byte)RoleGroup.Arbitrator);

        var role2Owners = internalUserRoles2
            .Select(x => (int?)x.UserId)
            .Distinct();
        var systemUsers2 = await unitOfWork.SystemUserRepository
            .FindAllAsync(x => x.SystemUserRoleId == (int)Roles.StaffUser && role2Owners.Contains(x.SystemUserId));
        var systemUsers2Ids = systemUsers2.Select(x => x.SystemUserId).ToList();
        var statusesArbOwners = disputeStatuses
            .Where(x => x.Owner.HasValue && systemUsers2Ids.Contains(x.Owner.Value))
            .DistinctBy(x => x.Owner.GetValueOrDefault());
        return statusesArbOwners.Count();
    }

    public static int GetTotalStage6TimeMin(IUnitOfWork unitOfWork, List<DisputeStatus> disputeStatuses)
    {
        var totalStage6TimeMin = disputeStatuses
            .Where(x => x.Stage == (byte)DisputeStage.HearingPending)
            .Sum(x => x.DurationSeconds / 60);
        return totalStage6TimeMin ?? 0;
    }

    public static int GetTotalStage8TimeMin(IUnitOfWork unitOfWork, List<DisputeStatus> disputeStatuses)
    {
        var totalStage8TimeMin = disputeStatuses
            .Where(x => x.Stage == (byte)DisputeStage.Hearing)
            .Sum(x => x.DurationSeconds / 60);
        return totalStage8TimeMin ?? 0;
    }

    public static(DateTime utcStart, DateTime utcEnd) GetUtcRange()
    {
        TimeZoneInfo.ClearCachedData();
        var timezone = TimeZoneInfo.FindSystemTimeZoneById("Pacific Standard Time");
        var dateTimePst = TimeZoneInfo.ConvertTime(DateTime.UtcNow, timezone);

        var start = dateTimePst.AddDays(-1)
            .Date + new TimeSpan(0, 0, 0);
        var end = dateTimePst.AddDays(-1)
            .Date + new TimeSpan(23, 59, 59);

        var utcStart = TimeZoneInfo.ConvertTimeToUtc(start, timezone);
        var utcEnd = TimeZoneInfo.ConvertTimeToUtc(end, timezone);

        return (utcStart, utcEnd);
    }
}