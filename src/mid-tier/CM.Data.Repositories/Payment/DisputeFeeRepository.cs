using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.Payment;

public class DisputeFeeRepository : CmRepository<DisputeFee>, IDisputeFeeRepository
{
    public DisputeFeeRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<DateTime?> GetLastModifiedDate(int disputeFeeId)
    {
        var dates = await Context.DisputeFees
            .Where(c => c.DisputeFeeId == disputeFeeId)
            .Select(d => d.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }

    public async Task<List<DisputeFee>> GetByDisputeGuid(Guid disputeGuid)
    {
        var disputeFeeList = await Context.DisputeFees
            .Where(d => d.DisputeGuid == disputeGuid)
            .Include(df => df.PaymentTransactions)
            .ToListAsync();

        return disputeFeeList;
    }

    public async Task<bool> IsPaymentOverrideCodeExist(Guid disputeGuid, string code)
    {
        var exist = await Context.DisputeFees.AnyAsync(x => x.DisputeGuid == disputeGuid && x.PaymentOverrideCode == code);
        return exist;
    }

    public async Task<List<DisputeFee>> GetActiveDisputeFees(Guid disputeGuid)
    {
        var disputeFeeList = await Context.DisputeFees
            .Where(d => d.DisputeGuid == disputeGuid && d.IsActive)
            .Include(df => df.PaymentTransactions)
            .ToListAsync();

        return disputeFeeList;
    }

    public async Task<DisputeFee> GetWithTransactions(int disputeFeeId)
    {
        var disputeFee = await Context.DisputeFees
            .Include(t => t.PaymentTransactions)
            .SingleOrDefaultAsync(d => d.DisputeFeeId == disputeFeeId);

        return disputeFee;
    }

    public async Task<DisputeFee> GetLatestDisputeFee(Guid disputeGuid)
    {
        var latestDisputeFee = await Context.DisputeFees
            .Where(d => d.DisputeGuid == disputeGuid)
            .Include(df => df.PaymentTransactions)
            .OrderByDescending(x => x.DisputeFeeId)
            .FirstOrDefaultAsync();

        return latestDisputeFee;
    }

    public async Task<List<DisputeFee>> GetDisputeFeesByPaidDate(DateTime startDate, DateTime endDate)
    {
        var fees = await Context
            .DisputeFees
            .Where(x => x.IsPaid == true && x.DatePaid >= startDate && x.DatePaid <= endDate)
            .ToListAsync();
        return fees;
    }

    public async Task<bool> HasUnpaidIntakeFee(Guid disputeGuid)
    {
        var unpaidIntakeFee = await Context.DisputeFees
            .AnyAsync(d => d.DisputeGuid == disputeGuid &&
                           d.IsActive && d.IsPaid != null && d.IsPaid == false &&
                           (d.FeeType == (byte)DisputeFeeType.Intake || d.FeeType == (byte)DisputeFeeType.LandlordIntake));

        return unpaidIntakeFee;
    }
}