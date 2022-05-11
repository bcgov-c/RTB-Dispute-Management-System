using System.Threading.Tasks;
using CM.Business.Entities.Models.Payment;
using CM.Business.Services.Base;
using CM.Data.Model;

namespace CM.Business.Services.Payment;

public interface IPaymentTransactionService : IServiceBase, IDisputeResolver
{
    Task<PaymentTransactionResponse> CreateAsync(int disputeFeeId, PaymentTransactionPostRequest paymentTransaction);

    Task<bool> DeleteAsync(int paymentTransactionId);

    Task<PaymentTransaction> PatchAsync(PaymentTransaction paymentTransaction, int paymentTransactionId, bool offlineChecking);

    Task<PaymentTransaction> GetNoTrackingPaymentTransactionAsync(int paymentTransactionId);

    Task<PaymentTransactionForReport> GetByIdAsync(int transactionId);

    Task<PaymentTransactionResponse> CheckBamboraTransactionByTrnId(PaymentTransactionForReport paymentTransaction, int transactionId);

    Task<PaymentTransaction> ProcessTransaction(PaymentTransaction paymentTransaction, int paymentTransactionId);
}