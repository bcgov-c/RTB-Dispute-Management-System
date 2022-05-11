using System;
using System.Linq;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.Notice;

public class NoticeServiceRepository : CmRepository<NoticeService>, INoticeServiceRepository
{
    public NoticeServiceRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<DateTime?> GetLastModifiedDate(int noticeServiceId)
    {
        var dates = await Context.NoticeServices
            .Where(n => n.NoticeServiceId == noticeServiceId)
            .Select(n => n.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }

    public async Task<NoticeService> GetNServiceWithNotice(int noticeServiceId)
    {
        var noticeService = await Context.NoticeServices.Include(x => x.Notice).FirstOrDefaultAsync(x => x.NoticeServiceId == noticeServiceId);
        return noticeService;
    }
}