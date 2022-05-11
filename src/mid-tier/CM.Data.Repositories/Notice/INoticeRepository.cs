using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.Notice;

public interface INoticeRepository : IRepository<Model.Notice>
{
    Task<DateTime?> GetLastModifiedDate(int noticeId);

    Task<byte?> GetLastVersionNumberAsync(Guid disputeGuid);

    Task<Model.Notice> GetNoticeWithIncludedAsync(int noticeId);

    Task<IEnumerable<Model.Notice>> GetManyWithIncludedAsync(Guid disputeGuid);

    Task<IEnumerable<Model.Notice>> GetOriginalNoticesWithIncludedAsync(Guid disputeGuid, int? originalNoticeId);

    Task<IEnumerable<Model.Notice>> GetNoticesForDisputeAccess(Guid disputeGuid);

    Task<DateTime?> GetNoticeGeneratedDate(int hearingId, Guid disputeGuid);

    Task<Model.Notice> GetCurrentNotice(Guid disputeGuid);

    Task<List<Model.Notice>> GetParticipantNotices(int participantId, byte participantRole);

    Task<List<Model.Notice>> GetRespondentNotices(Guid disputeGuid);

    Task<List<Model.Notice>> GetApplicantNotices(Guid disputeGuid);
}