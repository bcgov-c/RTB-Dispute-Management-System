using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.Dispute;

public class DisputeRepository : CmRepository<Model.Dispute>, IDisputeRepository
{
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
                .Where(d => adminUserIds.Contains(d.OwnerSystemUserId))
                .OrderByDescending(md => md.DisputeLastModified.LastModifiedDate)
                .ToListAsync();
        }
        else
        {
            disputes = await Context.Disputes
                .Include(x => x.DisputeLastModified)
                .Where(d => d.OwnerSystemUserId == userId)
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

    public async Task<List<Model.Dispute>> GetDisputesWithLastModify(List<Guid> disputesGuid, DateTime? lastLoadedDateTime, int dateDelay)
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

        if (disputesGuid.Count > 0)
        {
            closedDisputes = await Context
                .Disputes
                .Include(x => x.DisputeStatuses)
                .Include(x => x.DisputeLastModified)
                .Where(x => !disputesGuid.Contains(x.DisputeGuid) && x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault().IsActive &&
                            ((x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault(ds => ds.IsActive).Stage == (byte)DisputeStage.ApplicationInProgress && statusesForStage0.Contains((DisputeStatuses)x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault(a => a.IsActive).Status))
                             || (x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault(ds => ds.IsActive).Stage == (byte)DisputeStage.ApplicationScreening && statusesForStage2.Contains((DisputeStatuses)x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault(a => a.IsActive).Status))
                             || (x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault(ds => ds.IsActive).Stage == (byte)DisputeStage.ServingDocuments && statusesForStage4.Contains((DisputeStatuses)x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault(a => a.IsActive).Status))
                             || (x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault(ds => ds.IsActive).Stage == (byte)DisputeStage.HearingPending && (DisputeStatuses)x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault(a => a.IsActive).Status == DisputeStatuses.Withdrawn)
                             || (x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault(ds => ds.IsActive).Stage == (byte)DisputeStage.DecisionAndPostSupport && (DisputeStatuses)x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault(a => a.IsActive).Status == DisputeStatuses.Closed)))
                .ToListAsync();
        }
        else
        {
            closedDisputes = await Context
                .Disputes
                .Include(x => x.DisputeStatuses)
                .Include(x => x.DisputeLastModified)
                .Where(x => x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault().IsActive &&
                            ((x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault(ds => ds.IsActive).Stage == (byte)DisputeStage.ApplicationInProgress && statusesForStage0.Contains((DisputeStatuses)x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault(a => a.IsActive).Status))
                             || (x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault(ds => ds.IsActive).Stage == (byte)DisputeStage.ApplicationScreening && statusesForStage2.Contains((DisputeStatuses)x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault(a => a.IsActive).Status))
                             || (x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault(ds => ds.IsActive).Stage == (byte)DisputeStage.ServingDocuments && statusesForStage4.Contains((DisputeStatuses)x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault(a => a.IsActive).Status))
                             || (x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault(ds => ds.IsActive).Stage == (byte)DisputeStage.HearingPending && (DisputeStatuses)x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault(a => a.IsActive).Status == DisputeStatuses.Withdrawn)
                             || (x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault(ds => ds.IsActive).Stage == (byte)DisputeStage.DecisionAndPostSupport && (DisputeStatuses)x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault(a => a.IsActive).Status == DisputeStatuses.Closed)))
                .ToListAsync();
        }

        List<Model.Dispute> factDisputes;

        if (lastLoadedDateTime.HasValue)
        {
            factDisputes = await Context.Disputes
                .Include(x => x.DisputeStatuses)
                .Include(x => x.DisputeLastModified)
                .Where(x => x.DisputeStatuses.OrderByDescending(ds => ds.DisputeStatusId).FirstOrDefault().IsActive
                            && disputesGuid.Contains(x.DisputeGuid)
                            ////&& x.DisputeLastModified.LastModifiedDate < now.AddDays(-dateDelay)
                            && x.DisputeLastModified.LastModifiedDate > lastLoadedDateTime)
                .ToListAsync();
        }
        else
        {
            factDisputes = await Context.Disputes
                .Include(x => x.DisputeLastModified)
                .Where(x => disputesGuid.Contains(x.DisputeGuid))
                .ToListAsync();
        }

        var disputes = closedDisputes.Union(factDisputes).ToList();

        disputes = disputes.Where(x => x.DisputeLastModified.LastModifiedDate < now.AddDays(-dateDelay)).ToList();

        return disputes;
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