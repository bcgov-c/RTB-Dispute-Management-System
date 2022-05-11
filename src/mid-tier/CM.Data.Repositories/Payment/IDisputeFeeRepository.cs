using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.Payment;

public interface IDisputeFeeRepository : IRepository<DisputeFee>
{
    Task<DateTime?> GetLastModifiedDate(int disputeFeeId);

    Task<List<DisputeFee>> GetByDisputeGuid(Guid disputeGuid);

    Task<List<DisputeFee>> GetActiveDisputeFees(Guid disputeGuid);

    Task<DisputeFee> GetWithTransactions(int disputeFeeId);

    Task<DisputeFee> GetLatestDisputeFee(Guid disputeGuid);

    Task<bool> IsPaymentOverrideCodeExist(Guid disputeGuid, string code);

    Task<List<DisputeFee>> GetDisputeFeesByPaidDate(DateTime startDate, DateTime endDate);

    Task<bool> HasUnpaidIntakeFee(Guid disputeGuid);
}