using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.Dispute;

public class DisputeRepository : CmRepository<Model.Dispute>, IDisputeRepository
{
    private readonly List<byte> allowedTypes = new List<byte>
        {
            (byte)NoticeTypes.GeneratedDisputeNotice,
            (byte)NoticeTypes.UploadedDisputeNotice,
            (byte)NoticeTypes.UploadedOtherNotice
        };

    private readonly List<int> cnIssues = new List<int> { 208, 230, 205, 231, 204, 232, 207, 233, 203, 234, 224, 235, 206, 236 };

    public DisputeRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<int> GetDisputesCountAsync(int userId, int? creationMethod)
    {
        List<Model.Dispute> disputes;
        var adminUserIds = await Context.SystemUsers
            .Where(u => u.SystemUserRoleId == (int)Roles.StaffUser)
            .Select(u => u.SystemUserId)
            .ToListAsync();

        if (adminUserIds.Contains(userId))
        {
            disputes = await Context.Disputes
                .Where(u => adminUserIds.Contains(u.OwnerSystemUserId)).ToListAsync();
        }
        else
        {
            disputes = await Context.Disputes
                .Where(d => d.OwnerSystemUserId == userId).ToListAsync();
        }

        if (creationMethod != null)
        {
            disputes = disputes.Where(x => x.CreationMethod == creationMethod).ToList();
        }

        return disputes.Count;
    }

    public async Task<List<Model.Dispute>> GetUsersDisputesAsync(int userId, int count, int index, int? creationMethod)
    {
        List<Model.Dispute> disputes;

        var adminUserIds = await Context.SystemUsers
            .Where(u => u.SystemUserRoleId == (int)Roles.StaffUser)
            .Select(u => u.SystemUserId)
            .ToListAsync();

        if (adminUserIds.Contains(userId))
        {
            disputes = await Context.Disputes
                .Include(x => x.DisputeLastModified)
                .Include(x => x.DisputeUsers)
                .Where(d => adminUserIds.Contains(d.OwnerSystemUserId) &&
                        d.DisputeUsers.Where(du => du.IsActive == true && du.DisputeGuid == d.DisputeGuid)
                                        .Any(du => adminUserIds.Contains(du.SystemUserId)))
                .OrderByDescending(md => md.DisputeLastModified.LastModifiedDate)
                .ToListAsync();
        }
        else
        {
            disputes = await Context.Disputes
                .Include(x => x.DisputeLastModified)
                .Include(x => x.DisputeUsers)
                .Where(d => d.OwnerSystemUserId == userId &&
                        d.DisputeUsers.Where(du => du.IsActive == true && du.DisputeGuid == d.DisputeGuid)
                                        .Any(du => du.SystemUserId == userId))
                .OrderByDescending(md => md.DisputeLastModified.LastModifiedDate)
                .ToListAsync();
        }

        if (creationMethod != null)
        {
            disputes = disputes.Where(x => x.CreationMethod == creationMethod).ToList();
        }

        var result = await disputes.ApplyPagingArrayStyleAsync(count, index);

        return result;
    }

    public async Task<Model.Dispute> GetDisputeByGuidAsync(Guid disputeGuid)
    {
        var dispute = await Context.Disputes.Include(x => x.DisputeLastModified)
            .SingleOrDefaultAsync(d => d.DisputeGuid == disputeGuid);

        if (dispute != null)
        {
            dispute = await AttachDisputeHearings(dispute);
            return dispute;
        }

        return null;
    }

    public async Task<Model.Dispute> GetDispute(Guid disputeGuid)
    {
        var dispute = await Context.Disputes.Include(x => x.DisputeLastModified)
            .SingleOrDefaultAsync(d => d.DisputeGuid == disputeGuid);

        return dispute;
    }

    public async Task<Model.Dispute> GetDisputeWithStatusByGuidAsync(Guid disputeGuid)
    {
        var dispute = await Context.Disputes
            .Include(x => x.DisputeLastModified)
            .Include(d => d.DisputeStatuses)
            .SingleOrDefaultAsync(d => d.DisputeGuid == disputeGuid);

        return dispute;
    }

    public async Task<Model.Dispute> GetNoTrackDisputeByGuidAsync(Guid disputeGuid)
    {
        var dispute = await Context.Disputes.AsNoTracking()
            .Include(d => d.DisputeStatuses)
            .SingleOrDefaultAsync(d => d.DisputeGuid == disputeGuid);

        return dispute;
    }

    public async Task<DateTime?> GetLastModifiedDate(Guid disputeGuid)
    {
        var lastModifiedDate = await Context.Disputes
            .Where(d => d.DisputeGuid == disputeGuid)
            .Select(d => d.ModifiedDate).ToListAsync();

        return lastModifiedDate.FirstOrDefault();
    }

    public async Task<Model.Dispute> GetDisputeByFileNumber(int fileNumber)
    {
        var dispute = await Context.Disputes.FirstOrDefaultAsync(x => x.FileNumber == fileNumber);
        return dispute;
    }

    public async Task<int?> GetFileNumber(Guid disputeGuid)
    {
        var fileNumber = await Context.Disputes
            .Where(d => d.DisputeGuid == disputeGuid)
            .Select(d => d.FileNumber)
            .ToListAsync();

        return fileNumber.FirstOrDefault();
    }

    public async Task<Model.Dispute> GetDisputeByFileNumberWithStatus(int fileNumber)
    {
        var dispute = await Context.Disputes
            .Include(x => x.DisputeLastModified)
            .Include(d => d.DisputeStatuses)
            .FirstOrDefaultAsync(x => x.FileNumber.Equals(fileNumber));
        return dispute;
    }

    public async Task<List<Model.Dispute>> GetDisputesWithLastModify(int dateDelay)
    {
        var now = DateTime.UtcNow;

        var statusesForStage0 = new[]
        {
            DisputeStatuses.Withdrawn,
            DisputeStatuses.AbandonedNoPayment,
            DisputeStatuses.AbandonedApplicantInaction
        };

        var statusesForStage2 = new[]
        {
            DisputeStatuses.Withdrawn,
            DisputeStatuses.CancelledByRtb,
            DisputeStatuses.AbandonedApplicantInaction
        };

        var statusesForStage4 = new[]
        {
            DisputeStatuses.Withdrawn,
            DisputeStatuses.Dismissed,
            DisputeStatuses.AbandonedApplicantInaction
        };

        var closedDisputes = new List<Model.Dispute>();

        Expression<Func<Model.Dispute, bool>> disputePredicate = (x) => true;

        disputePredicate = disputePredicate.And(x => x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault().IsActive &&
                            ((x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault(ds => ds.IsActive).Stage == (byte)DisputeStage.ApplicationInProgress && statusesForStage0.Contains((DisputeStatuses)x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault(a => a.IsActive).Status))
                             || (x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault(ds => ds.IsActive).Stage == (byte)DisputeStage.ApplicationScreening && statusesForStage2.Contains((DisputeStatuses)x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault(a => a.IsActive).Status))
                             || (x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault(ds => ds.IsActive).Stage == (byte)DisputeStage.ServingDocuments && statusesForStage4.Contains((DisputeStatuses)x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault(a => a.IsActive).Status))
                             || (x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault(ds => ds.IsActive).Stage == (byte)DisputeStage.HearingPending && (DisputeStatuses)x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault(a => a.IsActive).Status == DisputeStatuses.Withdrawn)
                             || (x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault(ds => ds.IsActive).Stage == (byte)DisputeStage.DecisionAndPostSupport && (DisputeStatuses)x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault(a => a.IsActive).Status == DisputeStatuses.Closed)));

        if (dateDelay != 0)
        {
            disputePredicate = disputePredicate
                .And(x => x.DisputeLastModified != null && x.DisputeLastModified.LastModifiedDate < now.AddDays(-dateDelay));
        }

        closedDisputes = await Context
                .Disputes
                .Include(x => x.DisputeStatuses)
                .Include(x => x.DisputeLastModified)
                .Where(disputePredicate)
                .ToListAsync();

        return closedDisputes;
    }

    public async Task<List<Model.Dispute>> GetDisputeByInitialPaymentDate(DateTime startDate, DateTime endDate)
    {
        var disputes = await Context.Disputes.Include(x => x.DisputeStatuses).Where(x => x.InitialPaymentDate >= startDate && x.InitialPaymentDate <= endDate).ToListAsync();
        return disputes;
    }

    public async Task<int> GetOpenDisputesCount()
    {
        int[] openArray = { (int)DisputeStatuses.Withdrawn, (int)DisputeStatuses.CancelledByRtb, (int)DisputeStatuses.AbandonedNoPayment, (int)DisputeStatuses.Dismissed, (int)DisputeStatuses.AbandonedApplicantInaction, (int)DisputeStatuses.Deleted, (int)DisputeStatuses.Closed };
        var disputesCount = await Context
            .Disputes
            .Include(x => x.DisputeStatuses)
            .Where(x => x.InitialPaymentDate != null
                        && !openArray.Contains(x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault().Status)
                        && x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault().IsActive).CountAsync();

        return disputesCount;
    }

    public async Task<List<Model.Dispute>> GetDisputesByDisputeGuid(List<Guid> disputeGuids)
    {
        var disputes = await Context.Disputes
            .Where(x => disputeGuids.Contains(x.DisputeGuid))
            .ToListAsync();

        return disputes;
    }

    public async Task<int> GetStage2Unassigned(byte? urgency)
    {
        int[] stageOpenArray =
    {
        (int)DisputeStatuses.Withdrawn,
        (int)DisputeStatuses.CancelledByRtb,
        (int)DisputeStatuses.AbandonedNoPayment,
        (int)DisputeStatuses.Dismissed,
        (int)DisputeStatuses.AbandonedApplicantInaction
    };

        var disputesCount = await Context
            .Disputes
            .Include(x => x.DisputeStatuses)
            .CountAsync(x => x.DisputeUrgency == urgency
                            && x.DisputeStatuses.FirstOrDefault(x => x.IsActive).Stage == (byte)DisputeStage.ApplicationScreening
                            && (x.DisputeStatuses.FirstOrDefault(x => x.IsActive).Owner == null || x.DisputeStatuses.FirstOrDefault(x => x.IsActive).Owner == 0)
                            && !stageOpenArray.Contains(x.DisputeStatuses.FirstOrDefault(x => x.IsActive).Status));

        return disputesCount;
    }

    public async Task<List<Guid>> GetArsDeclarationDeadlineReminderDisputeGuids(int dayDelay)
    {
        var dayHours = 24;
        var now = DateTime.UtcNow;
        var twoDayHours = dayDelay * dayHours;
        var threeDayHours = (dayDelay + 1) * dayHours;

        var disputes = await Context
            .Disputes
            .Include(x => x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId))
            .Include(x => x.Notices.OrderByDescending(n => n.NoticeId))
            .Where(x => x.DisputeStatuses.FirstOrDefault(x => x.IsActive == true).Stage == (byte?)DisputeStage.ServingDocuments
                    && x.DisputeStatuses.FirstOrDefault(x => x.IsActive == true).Status == (byte)DisputeStatuses.WaitingForProofOfService
                    && x.DisputeStatuses.FirstOrDefault(x => x.IsActive == true).Process == (byte?)DisputeProcess.ParticipatoryHearing
                    && x.Notices.Any(n => allowedTypes.Contains(n.NoticeType)
                                        && n.NoticeDeliveredDate != null
                                        && n.HasServiceDeadline == true
                                        && n.ServiceDeadlineDate.HasValue
                                        && n.ServiceDeadlineDate.Value >= now.AddHours(twoDayHours)
                                        && n.ServiceDeadlineDate.Value <= now.AddHours(threeDayHours)))
            .Select(x => x.DisputeGuid)
            .ToListAsync();

        return disputes;
    }

    public async Task<List<Guid>> GetArsDeclarationDeadlineMissedDisputeGuids()
    {
        var disputes = await Context
            .Disputes
            .Include(x => x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId))
            .Include(x => x.Notices.OrderByDescending(n => n.NoticeId))
            .Where(x => x.DisputeStatuses.FirstOrDefault(x => x.IsActive == true).Stage == (byte?)DisputeStage.ServingDocuments
                && x.DisputeStatuses.FirstOrDefault(x => x.IsActive == true).Status == (byte)DisputeStatuses.WaitingForProofOfService
                && x.DisputeStatuses.FirstOrDefault(x => x.IsActive == true).Process == (byte?)DisputeProcess.ParticipatoryHearing
                && x.Notices.Any(n => allowedTypes.Contains(n.NoticeType)
                                        && n.NoticeDeliveredDate != null
                                        && n.HasServiceDeadline == true
                                        && n.ServiceDeadlineDate.HasValue
                                        && n.ServiceDeadlineDate.Value < DateTime.UtcNow))
            .Select(x => x.DisputeGuid)
            .ToListAsync();

        return disputes;
    }

    public async Task<List<Guid>> GetArsReinstatementDeadlineReminderDisputeGuids(int dayDelay)
    {
        var dayHours = 24;
        var now = DateTime.UtcNow;
        var twoDayHours = dayDelay * dayHours;
        var threeDayHours = (dayDelay + 1) * dayHours;

        var disputes = await Context
            .Disputes
            .Include(x => x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId))
            .Include(x => x.Notices.OrderByDescending(n => n.NoticeId))
            .Where(x => x.DisputeStatuses.FirstOrDefault(x => x.IsActive == true).Stage == (byte?)DisputeStage.ServingDocuments
                && x.DisputeStatuses.FirstOrDefault(x => x.IsActive == true).Status == (byte)DisputeStatuses.Dismissed
                && x.DisputeStatuses.FirstOrDefault(x => x.IsActive == true).Process == (byte?)DisputeProcess.ParticipatoryHearing
                && x.Notices.Any(n => allowedTypes.Contains(n.NoticeType)
                                        && n.NoticeDeliveredDate != null
                                        && n.HasServiceDeadline == true
                                        && n.ServiceDeadlineDate.HasValue
                                        && n.SecondServiceDeadlineDate.HasValue
                                        && n.SecondServiceDeadlineDate.Value >= now.AddHours(twoDayHours)
                                        && n.SecondServiceDeadlineDate.Value <= now.AddHours(threeDayHours)))
            .Select(x => x.DisputeGuid)
            .ToListAsync();

        return disputes;
    }

    public async Task<List<Guid>> GetArsReinstatementDeadlineMissedDisputeGuids()
    {
        var disputes = await Context
            .Disputes
            .Include(x => x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId))
            .Include(x => x.Notices.OrderByDescending(n => n.NoticeId))
            .Where(x => x.DisputeStatuses.FirstOrDefault(x => x.IsActive == true).Stage == (byte?)DisputeStage.ServingDocuments
                && x.DisputeStatuses.FirstOrDefault(x => x.IsActive == true).Status == (byte)DisputeStatuses.Dismissed
                && x.DisputeStatuses.FirstOrDefault(x => x.IsActive == true).Process == (byte?)DisputeProcess.ParticipatoryHearing
                && x.Notices.Any(n => allowedTypes.Contains(n.NoticeType)
                                        && n.NoticeDeliveredDate != null
                                        && n.HasServiceDeadline == true
                                        && n.ServiceDeadlineDate.HasValue
                                        && n.SecondServiceDeadlineDate.HasValue
                                        && n.SecondServiceDeadlineDate.Value < DateTime.UtcNow))
            .Select(x => x.DisputeGuid)
            .ToListAsync();

        return disputes;
    }

    public async Task<List<Guid>> GetMhvAppCnDisputes(
        int daysPriorToHearing,
        SharedHearingLinkType[] sharedHearingLinkTypes,
        DisputeCreationMethod[] creationMethods,
        bool isCnIssuesContain)
    {
        if (!isCnIssuesContain)
        {
            return await GetMhvAppNotCnIssuesDisputes(daysPriorToHearing, sharedHearingLinkTypes, creationMethods);
        }

        var disputes = await Context
            .Disputes
            .Include(x => x.DisputeHearings).ThenInclude(x => x.Hearing)
            .Include(x => x.Notices)
            .Include(x => x.ClaimGroups).ThenInclude(x => x.Claims)
            .Where(x => (x.DisputeUrgency == (byte?)DisputeUrgency.Regular ||
                        x.DisputeUrgency == (byte?)DisputeUrgency.Deferred) &&
                        x.DisputeHearings.Count == 1 &&
                        sharedHearingLinkTypes.Contains((SharedHearingLinkType)x.DisputeHearings.FirstOrDefault().SharedHearingLinkType) &&
                        x.DisputeHearings.FirstOrDefault(x => x.Hearing.HearingStartDateTime != null).Hearing.HearingStartDateTime.Value.Date == DateTime.UtcNow.Date.AddDays(daysPriorToHearing) &&
                        x.Notices.Where(n => n.NoticeDeliveredDate != null).Count() > 0 &&
                        creationMethods.Contains((DisputeCreationMethod)x.CreationMethod) &&
                        x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault().Stage == (byte?)DisputeStage.HearingPending &&
                        (x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault().Status == (byte)DisputeStatuses.OpenForSubmissions ||
                        x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault().Status == (byte)DisputeStatuses.ClosedForSubmissions) &&
                        x.ClaimGroups.Any(cg => cg.Claims.Any(c => cnIssues.Contains(c.ClaimCode.Value))))
            .Select(x => x.DisputeGuid)
            .Distinct()
            .ToListAsync();

        return disputes;
    }

    public async Task<List<Guid>> GetMhvAppNotCnIssuesDisputes(
        int daysPriorToHearing,
        SharedHearingLinkType[] sharedHearingLinkTypes,
        DisputeCreationMethod[] creationMethods)
    {
        var disputes = await Context
            .Disputes
            .Include(x => x.DisputeHearings).ThenInclude(x => x.Hearing)
            .Include(x => x.Notices)
            .Include(x => x.ClaimGroups).ThenInclude(x => x.Claims)
            .Where(x => (x.DisputeUrgency == (byte?)DisputeUrgency.Regular ||
                        x.DisputeUrgency == (byte?)DisputeUrgency.Deferred) &&
                        x.DisputeHearings.Count == 1 &&
                        sharedHearingLinkTypes.Contains((SharedHearingLinkType)x.DisputeHearings.FirstOrDefault().SharedHearingLinkType) &&
                        x.DisputeHearings.FirstOrDefault(x => x.Hearing.HearingStartDateTime != null).Hearing.HearingStartDateTime.Value.Date == DateTime.UtcNow.Date.AddDays(daysPriorToHearing) &&
                        x.Notices.Where(n => n.NoticeDeliveredDate != null).Count() > 0 &&
                        creationMethods.Contains((DisputeCreationMethod)x.CreationMethod) &&
                        x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault().Stage == (byte?)DisputeStage.HearingPending &&
                        (x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault().Status == (byte)DisputeStatuses.OpenForSubmissions ||
                        x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault().Status == (byte)DisputeStatuses.ClosedForSubmissions) &&
                        !x.ClaimGroups.Any(cg => cg.Claims.Any(c => cnIssues.Contains(c.ClaimCode.Value))))
            .Select(x => x.DisputeGuid)
            .Distinct()
            .ToListAsync();

        return disputes;
    }

    private async Task<Model.Dispute> AttachDisputeHearings(Model.Dispute dispute)
    {
        var disputeHearings = await Context.DisputeHearings
            .Where(x => x.DisputeGuid == dispute.DisputeGuid &&
                        x.DisputeHearingStatus == (byte)DisputeHearingStatus.Active)
            .ToListAsync();
        dispute.DisputeHearings = disputeHearings;

        return dispute;
    }
}