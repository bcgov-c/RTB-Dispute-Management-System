using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.OutcomeDocRequest;

public class OutcomeDocRequestRepository : CmRepository<Model.OutcomeDocRequest>, IOutcomeDocRequestRepository
{
    public OutcomeDocRequestRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<List<Model.OutcomeDocRequest>> GetByDisputeWithChild(Guid disputeGuid)
    {
        var outcomeDocRequests = await Context
            .OutcomeDocRequests
            .Include(x => x.OutcomeDocReqItems)
            .Where(x => x.DisputeGuid == disputeGuid)
            .ToListAsync();
        return outcomeDocRequests;
    }

    public async Task<Model.OutcomeDocRequest> GetByIdWithChild(int outcomeDocRequestId)
    {
        var outcomeDocRequest = await Context
            .OutcomeDocRequests
            .Include(x => x.OutcomeDocReqItems)
            .FirstOrDefaultAsync(x => x.OutcomeDocRequestId == outcomeDocRequestId);
        return outcomeDocRequest;
    }

    public async Task<DateTime?> GetLastModifiedDate(int id)
    {
        var dates = await Context.OutcomeDocRequests
            .Where(n => n.OutcomeDocRequestId == id)
            .Select(n => n.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }

    public async Task<List<Model.OutcomeDocRequest>> GetOutcomeDocRequests(Guid disputeGuid)
    {
        var outcomeDocRequests = await Context.OutcomeDocRequests
            .Where(x => x.DisputeGuid == disputeGuid)
            .ToListAsync();

        return outcomeDocRequests;
    }

    public async Task<List<Model.OutcomeDocRequest>> GetRequestsByCreatedDate(DateTime startDate, DateTime endDate)
    {
        var requests = await Context.OutcomeDocRequests.Where(x => x.CreatedDate >= startDate && x.CreatedDate <= endDate).ToListAsync();
        return requests;
    }

    public async Task<bool> IsOutcomeDocRequestExist(int outcomeDocRequestId)
    {
        var isExist = await Context.OutcomeDocRequests.AnyAsync(x => x.OutcomeDocRequestId == outcomeDocRequestId);
        return isExist;
    }
}