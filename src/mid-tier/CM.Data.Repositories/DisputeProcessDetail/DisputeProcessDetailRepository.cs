using System;
using System.Linq;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.DisputeProcessDetail;

public class DisputeProcessDetailRepository : CmRepository<Model.DisputeProcessDetail>, IDisputeProcessDetailRepository
{
    public DisputeProcessDetailRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<Model.DisputeProcessDetail> GetLastDisputeProcessDetail(Guid disputeGuid)
    {
        var disputeProcessDetails = await Context.DisputeProcessDetails.Where(d => d.DisputeGuid == disputeGuid).ToListAsync();
        if (disputeProcessDetails != null && disputeProcessDetails.Any())
        {
            var lastProcessDetail = disputeProcessDetails.OrderByDescending(d => d.DisputeProcessDetailId).LastOrDefault();
            return lastProcessDetail;
        }

        return null;
    }

    public async Task<DateTime?> GetLastModifiedDate(int id)
    {
        var dates = await Context.DisputeProcessDetails
            .Where(c => c.DisputeProcessDetailId == id)
            .Select(d => d.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }
}