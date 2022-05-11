using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.Notice;
using CM.Business.Services.Base;

namespace CM.Business.Services.Notice;

public interface INoticeService : IServiceBase, IDisputeResolver
{
    Task<NoticeResponse> CreateAsync(Guid disputeGuid, NoticePostRequest request);

    Task<bool> DeleteAsync(int noticeId);

    Task<Data.Model.Notice> PatchAsync(Data.Model.Notice notice);

    Task<Data.Model.Notice> GetNoTrackingNoticeAsync(int noticeId);

    Task<NoticeResponse> GetByIdAsync(int noticeId);

    Task<List<NoticeResponse>> GetByDisputeGuidAsync(Guid disputeGuid);

    Task<bool> IfChildNoticeServiceExists(int noticeId);

    Task<bool> IfDisputeParticipantExists(int? participantId, Guid disputeGuid);

    Task<bool> NoticeExists(int noticeId);

    Task<bool> GetParentNotice(int parentNoticeId, Guid disputeGuid);
}