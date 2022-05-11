using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Services.SystemSettingsService;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.Payment;

public class PaymentConfirmationService : CmServiceBase, IPaymentConfirmationService
{
    public PaymentConfirmationService(IMapper mapper, IUnitOfWork unitOfWork, ISystemSettingsService settingsService, IPaymentTransactionService paymentTransactionService)
        : base(unitOfWork, mapper)
    {
        SystemSettingsService = settingsService;
        PaymentTransactionService = paymentTransactionService;
    }

    private ISystemSettingsService SystemSettingsService { get; }

    private IPaymentTransactionService PaymentTransactionService { get; }

    public async Task<bool> ProcessPaymentConfirmation()
    {
        var retriesMaxCount = await SystemSettingsService.GetValueAsync<int>(SettingKeys.PaymentConfirmationNumberOfRetries);
        var delayBetweenRetries = await SystemSettingsService.GetValueAsync<int>(SettingKeys.PaymentConfirmationDelayBetweenRetries);

        var paymentTransactions = await UnitOfWork.PaymentTransactionRepository.GetPendingTransactions(retriesMaxCount, DateTime.UtcNow, delayBetweenRetries);

        foreach (var transaction in paymentTransactions)
        {
            transaction.PaymentVerifyRetries++;
            var paymentTransaction = await PaymentTransactionService.ProcessTransaction(transaction, transaction.PaymentTransactionId);

            UnitOfWork.PaymentTransactionRepository.Attach(paymentTransaction);
            var result = await UnitOfWork.Complete();
            return result.CheckSuccess();
        }

        return false;
    }
}