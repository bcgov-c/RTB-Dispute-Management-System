using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.Payment;

public class PaymentTransactionRepository : CmRepository<PaymentTransaction>, IPaymentTransactionRepository
{
    public PaymentTransactionRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<DateTime?> GetLastModifiedDate(int paymentTransactionId)
    {
        var dates = await Context.PaymentTransactions
            .Where(c => c.PaymentTransactionId == paymentTransactionId)
            .Select(d => d.ModifiedDate)
            .ToListAsync();

        return dates?.FirstOrDefault();
    }

    public async Task<List<PaymentTransaction>> GetPendingTransactions(int retriesMaxCount, DateTime lastTimeExecuted, double interval)
    {
        var disputeFees = Context.DisputeFees
            .Where(d => ((d.IsPaid == null) || (d.IsPaid == false)) &&
                        d.PaymentTransactions.Any(
                            p => ((p.TransactionMethod == (byte)PaymentMethod.Online) &&
                                  ((p.PaymentVerified == (byte)PaymentVerified.NotChecked) ||
                                   (p.PaymentVerified == (byte)PaymentVerified.Error)) &&
                                  (p.PaymentVerifyRetries <= retriesMaxCount) &&
                                  (p.TrnResponse == null) &&
                                  (p.ModifiedDate < lastTimeExecuted.AddSeconds(interval)))))
            .Select(d => d.DisputeFeeId);

        var paymentTransaction = Context.PaymentTransactions
            .Where(p => disputeFees.Contains(p.DisputeFeeId) &&
                        ((p.TransactionMethod == (byte)PaymentMethod.Online) &&
                         ((p.PaymentVerified == (byte)PaymentVerified.NotChecked) ||
                          (p.PaymentVerified == (byte)PaymentVerified.Error)) &&
                         (p.PaymentVerifyRetries <= retriesMaxCount) &&
                         (p.TrnResponse == null) &&
                         (p.ModifiedDate < lastTimeExecuted.AddSeconds(interval))));
        return await paymentTransaction.ToListAsync();
    }

    public async Task<List<PaymentTransaction>> GetTransactionsForReconciliations()
    {
        const int maxRecordCountLimit = 9999;
        var paymentTransactions = await Context.PaymentTransactions
            .Where(p => p.TransactionMethod == (byte)PaymentMethod.Online &&
                        p.TrnApproved &&
                        p.TransactionBy != null &&
                        (p.ReconcileStatus == (byte)ReconcileStatus.NotStarted ||
                         p.ReconcileStatus == (byte)ReconcileStatus.FailedToGenerate ||
                         p.ReconcileStatus == (byte)ReconcileStatus.FailedToSend))
            .OrderBy(p => p.PaymentTransactionId)
            .Take(maxRecordCountLimit)
            .ToListAsync();

        return paymentTransactions;
    }

    public async Task<int> GetLastTransactionId(int disputeFeeId)
    {
        var paymentTransactions = await Context
            .PaymentTransactions
            .Where(p => p.DisputeFeeId == disputeFeeId)
            .OrderByDescending(p => p.PaymentTransactionId)
            .Select(p => p.PaymentTransactionId)
            .ToListAsync();

        return paymentTransactions.FirstOrDefault();
    }
}