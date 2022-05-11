using System;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.Notice;

public interface INoticeServiceRepository : IRepository<NoticeService>
{
    Task<DateTime?> GetLastModifiedDate(int noticeServiceId);

    Task<NoticeService> GetNServiceWithNotice(int noticeServiceId);
}