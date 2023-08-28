using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.Notice;

public class NoticeRepository : CmRepository<Model.Notice>, INoticeRepository
{
    public NoticeRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<DateTime?> GetLastModifiedDate(int noticeId)
    {
        var dates = await Context.Notices
            .Where(n => n.NoticeId == noticeId)
            .Select(n => n.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }

    public async Task<byte?> GetLastVersionNumberAsync(Guid disputeGuid)
    {
        var versionNumbers = await Context.Notices
            .Where(n => n.DisputeGuid == disputeGuid)
            .Select(n => n.NoticeVersion)
            .ToListAsync();

        return versionNumbers?.Max();
    }

    public async Task<Model.Notice> GetNoticeWithIncludedAsync(int noticeId)
    {
        var notice = await Context.Notices
            .Include(n => n.NoticeServices)
            .SingleOrDefaultAsync(n => n.NoticeId == noticeId);

        return notice;
    }

    public async Task<IEnumerable<Model.Notice>> GetManyWithIncludedAsync(Guid disputeGuid)
    {
        var notices = await Context.Notices
            .Include(n => n.NoticeServices)
            .Where(n => n.DisputeGuid == disputeGuid)
            .ToListAsync();

        return notices;
    }

    public async Task<IEnumerable<Model.Notice>> GetOriginalNoticesWithIncludedAsync(Guid disputeGuid, int? originalNoticeId)
    {
        if (originalNoticeId != null)
        {
            var notices = await Context.Notices
                .Include(n => n.NoticeServices)
                .Where(n => n.DisputeGuid == disputeGuid && n.NoticeId == originalNoticeId)
                .ToListAsync();

            return notices;
        }
        else
        {
            var notices = await Context.Notices
                .Where(n => n.DisputeGuid == disputeGuid)
                .ToListAsync();

            foreach (var notice in notices)
            {
                notice.NoticeServices = new List<NoticeService>();
            }

            return notices;
        }
    }

    public async Task<IEnumerable<Model.Notice>> GetNoticesForDisputeAccess(Guid disputeGuid)
    {
        var notices = await Context.Notices
            .Include(n => n.NoticeServices)
            .Where(n => n.DisputeGuid == disputeGuid)
            .ToListAsync();

        return notices;
    }

    public async Task<DateTime?> GetNoticeGeneratedDate(int hearingId, Guid disputeGuid)
    {
        var notice = await Context.Notices.FirstOrDefaultAsync(x => x.HearingId.Equals(hearingId) && x.DisputeGuid == disputeGuid);
        return notice?.CreatedDate;
    }

    public async Task<Model.Notice> GetCurrentNotice(Guid disputeGuid)
    {
        var allowedTypes = new List<byte>
        {
            (byte)NoticeTypes.GeneratedDisputeNotice,
            (byte)NoticeTypes.UploadedDisputeNotice,
            (byte)NoticeTypes.UploadedOtherNotice
        };

        var currentNotice = await Context.Notices
            .Where(x => allowedTypes.Contains(x.NoticeType) && x.DisputeGuid == disputeGuid)
            .OrderByDescending(x => x.NoticeId)
            .FirstOrDefaultAsync();

        return currentNotice;
    }

    public async Task<List<Model.Notice>> GetParticipantNotices(int participantId, byte participantRole)
    {
        var notices = await Context.Notices.Where(x => x.Participant.ParticipantId == participantId && x.NoticeAssociatedTo == participantRole).ToListAsync();

        return notices;
    }

    public async Task<List<Model.Notice>> GetRespondentNotices(Guid disputeGuid)
    {
        var notices = await Context.Notices.Where(x => x.DisputeGuid == disputeGuid && x.NoticeAssociatedTo == (byte)ParticipantRole.Respondent).ToListAsync();

        return notices;
    }

    public async Task<List<Model.Notice>> GetApplicantNotices(Guid disputeGuid)
    {
        var notices = await Context.Notices.Where(x => x.DisputeGuid == disputeGuid && x.NoticeAssociatedTo != (byte)ParticipantRole.Respondent).ToListAsync();

        return notices;
    }

    public async Task<Model.Notice> GetNoticeForEmail(Guid disputeGuid, int participantId)
    {
        var notice = await Context.Notices.SingleOrDefaultAsync(n =>
            n.DisputeGuid == disputeGuid && n.NoticeDeliveredTo == participantId);

        return notice;
    }

    public async Task<Model.Notice> GetLastNotice(Guid disputeGuid, NoticeTypes[] types)
    {
        if (types == null || types.Length == 0)
        {
            return await GetLastNotice(disputeGuid);
        }

        var lastNotice = await Context.Notices
            .Where(x => x.DisputeGuid == disputeGuid && types.Contains((NoticeTypes)x.NoticeType))
            .OrderByDescending(x => x.NoticeId)
            .FirstOrDefaultAsync();

        return lastNotice;
    }

    private async Task<Model.Notice> GetLastNotice(Guid disputeGuid)
    {
        var lastNotice = await Context.Notices
            .Where(x => x.DisputeGuid == disputeGuid)
            .OrderByDescending(x => x.NoticeId)
            .FirstOrDefaultAsync();

        return lastNotice;
    }
}