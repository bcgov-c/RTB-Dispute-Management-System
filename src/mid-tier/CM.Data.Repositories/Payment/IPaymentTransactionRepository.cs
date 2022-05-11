using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.Payment;

public interface IPaymentTransactionRepository : IRepository<PaymentTransaction>
{
    Task<DateTime?> GetLastModifiedDate(int paymentTransactionId);

    Task<List<PaymentTransaction>> GetPendingTransactions(int retriesMaxCount, DateTime lastTimeExecuted, double interval);

    Task<List<PaymentTransaction>> GetTransactionsForReconciliations();

    Task<int> GetLastTransactionId(int disputeFeeId);
}