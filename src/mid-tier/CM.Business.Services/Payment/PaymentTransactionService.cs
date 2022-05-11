using System;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using AutoMapper;
using CM.Business.Entities.Models.Payment;
using CM.Business.Services.SystemSettingsService;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.Messages.EmailGenerator.Events;
using EasyNetQ;
using Serilog;

namespace CM.Business.Services.Payment;

public class PaymentTransactionService : CmServiceBase, IPaymentTransactionService
{
    private const string TrnMessageIdApproved = "1";
    private const string TrnMessageIdRejected = "7";
    private const string TrnMessageIdRejectedEx = "761";
    private string _gatewayBaseUrl;
    private string _hashKey;

    private string _merchantId;
    private string _reportingBaseUrl;
    private string _returnUrlAddLandlordIntake;
    private string _returnUrlDisputeAccess;
    private string _returnUrlIntake;
    private string _returnUrlOfficeSubmission;

    public PaymentTransactionService(IMapper mapper, IUnitOfWork unitOfWork, ISystemSettingsService settingsService, IBus bus)
        : base(unitOfWork, mapper)
    {
        Bus = bus;
        SystemSettingsService = settingsService;
    }

    private IBus Bus { get; }

    private ISystemSettingsService SystemSettingsService { get; }

    public async Task<Guid> ResolveDisputeGuid(int id)
    {
        var entityPaymentTransaction = await UnitOfWork.PaymentTransactionRepository.GetNoTrackingByIdAsync(x => x.PaymentTransactionId == id);
        if (entityPaymentTransaction != null)
        {
            var entityDisputeFee = await UnitOfWork.DisputeFeeRepository.GetNoTrackingByIdAsync(x => x.DisputeFeeId == entityPaymentTransaction.DisputeFeeId);
            return entityDisputeFee?.DisputeGuid ?? Guid.Empty;
        }

        return Guid.Empty;
    }

    public async Task<PaymentTransactionResponse> CreateAsync(int disputeFeeId, PaymentTransactionPostRequest paymentTransaction)
    {
        var newPaymentTransaction = MapperService.Map<PaymentTransactionRequest, PaymentTransaction>(paymentTransaction);
        newPaymentTransaction.DisputeFeeId = disputeFeeId;
        newPaymentTransaction.IsDeleted = false;
        newPaymentTransaction.PaymentVerified = (byte)PaymentVerified.NotChecked;
        newPaymentTransaction.PaymentVerifyRetries = 0;

        var disputeFee = await UnitOfWork.DisputeFeeRepository.GetByIdAsync(disputeFeeId);
        if (paymentTransaction.PaymentStatus == (int)PaymentStatus.ApprovedOrPaid)
        {
            disputeFee.IsPaid = true;
            disputeFee.DatePaid = DateTime.UtcNow;
            if (paymentTransaction.TransactionMethod != null)
            {
                disputeFee.MethodPaid = (byte?)paymentTransaction.TransactionMethod;
            }

            if (paymentTransaction.TransactionAmount != null)
            {
                disputeFee.AmountPaid = paymentTransaction.TransactionAmount;
            }
        }

        if (paymentTransaction.PaymentStatus != (int)PaymentStatus.ApprovedOrPaid)
        {
            disputeFee.IsPaid = false;
            disputeFee.DatePaid = DateTime.UtcNow;

            if (paymentTransaction.TransactionAmount != null)
            {
                disputeFee.AmountPaid = paymentTransaction.TransactionAmount;
            }

            if (paymentTransaction.TransactionMethod != null)
            {
                disputeFee.MethodPaid = (byte?)paymentTransaction.TransactionMethod;
            }
        }

        UnitOfWork.DisputeFeeRepository.Attach(disputeFee);
        var result = await UnitOfWork.PaymentTransactionRepository.InsertAsync(newPaymentTransaction);
        var complete = await UnitOfWork.Complete();

        if (complete.CheckSuccess() && disputeFee.IsPaid == true)
        {
            var message = new EmailGenerateIntegrationEvent
            {
                DisputeGuid = disputeFee.DisputeGuid,
                MessageType = EmailMessageType.Notification,
                AssignedTemplateId = AssignedTemplate.PaymentSubmitted
            };

            if (disputeFee.PayorId != null)
            {
                message.ParticipantId = (int)disputeFee.PayorId;
            }

            Publish(message);
        }

        if (result != null)
        {
            if (paymentTransaction.PaymentProvider == (byte)PaymentProvider.Bambora)
            {
                var paymentDisputeFee = await UnitOfWork.DisputeFeeRepository.GetByIdAsync(disputeFeeId);
                var bamboraUrl = await GeneratePaymentUrl(result.PaymentTransactionId, paymentDisputeFee.DisputeGuid, paymentDisputeFee.AmountDue, disputeFee.FeeType, paymentTransaction.TransactionSiteSource);
                result.PaymentUrl = bamboraUrl;

                UnitOfWork.PaymentTransactionRepository.Attach(result);
                var completeResult = await UnitOfWork.Complete();
                completeResult.AssertSuccess();
            }

            return MapperService.Map<PaymentTransaction, PaymentTransactionResponse>(result);
        }

        return null;
    }

    public async Task<bool> DeleteAsync(int paymentTransactionId)
    {
        var paymentTransaction = await UnitOfWork.PaymentTransactionRepository.GetByIdAsync(paymentTransactionId);
        if (paymentTransaction != null)
        {
            paymentTransaction.IsDeleted = true;
            UnitOfWork.PaymentTransactionRepository.Attach(paymentTransaction);
            var result = await UnitOfWork.Complete();
            return result.CheckSuccess();
        }

        return false;
    }

    public async Task<PaymentTransaction> PatchAsync(PaymentTransaction paymentTransaction, int paymentTransactionId, bool offlineChecking)
    {
        var disputeFee = new DisputeFee();
        if (offlineChecking)
        {
            var parentDisputeFee =
                await UnitOfWork.DisputeFeeRepository.GetByIdAsync(paymentTransaction.DisputeFeeId);
            parentDisputeFee.AmountPaid = paymentTransaction.TransactionAmount;
            UnitOfWork.DisputeFeeRepository.Attach(parentDisputeFee);
            UnitOfWork.PaymentTransactionRepository.Attach(paymentTransaction);
            var completeResult = await UnitOfWork.Complete();
            completeResult.AssertSuccess();

            return paymentTransaction;
        }

        if (paymentTransaction.PaymentStatus != (int)PaymentStatus.ApprovedOrPaid)
        {
            disputeFee = await UnitOfWork.DisputeFeeRepository.GetByIdAsync(paymentTransaction.DisputeFeeId);
            var lastTransactionId = await GetLastPaymentTransactionId(disputeFee.DisputeFeeId);
            if (lastTransactionId == paymentTransactionId)
            {
                disputeFee.IsPaid = false;
                disputeFee.DatePaid = DateTime.UtcNow;
                disputeFee.MethodPaid = paymentTransaction.TransactionMethod;

                if (paymentTransaction.TransactionAmount != null)
                {
                    disputeFee.AmountPaid = paymentTransaction.TransactionAmount;
                }

                UnitOfWork.DisputeFeeRepository.Attach(disputeFee);
            }
        }

        if (paymentTransaction.PaymentStatus == (int)PaymentStatus.ApprovedOrPaid)
        {
            disputeFee = await UnitOfWork.DisputeFeeRepository.GetByIdAsync(paymentTransaction.DisputeFeeId);
            var lastTransactionId = await GetLastPaymentTransactionId(disputeFee.DisputeFeeId);
            if (lastTransactionId == paymentTransactionId)
            {
                disputeFee.IsPaid = true;
                if (paymentTransaction.TrnDate != null)
                {
                    disputeFee.DatePaid = paymentTransaction.TrnDate.Value.ToUniversalTime();
                }
                else
                {
                    disputeFee.DatePaid = DateTime.UtcNow;
                }

                disputeFee.AmountPaid = paymentTransaction.TransactionAmount;
                disputeFee.MethodPaid = paymentTransaction.TransactionMethod;

                UnitOfWork.DisputeFeeRepository.Attach(disputeFee);
            }
        }

        UnitOfWork.PaymentTransactionRepository.Attach(paymentTransaction);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess() && disputeFee.IsPaid == true)
        {
            var message = new EmailGenerateIntegrationEvent
            {
                DisputeGuid = disputeFee.DisputeGuid,
                MessageType = EmailMessageType.Notification,
                AssignedTemplateId = AssignedTemplate.PaymentSubmitted
            };

            if (disputeFee.PayorId != null)
            {
                message.ParticipantId = (int)disputeFee.PayorId;
            }

            Publish(message);
        }

        if (result.CheckSuccess())
        {
            return paymentTransaction;
        }

        return null;
    }

    public async Task<PaymentTransactionResponse> CheckBamboraTransactionByTrnId(PaymentTransactionForReport paymentTransactionForReport, int transactionId)
    {
        var paymentTransaction = MapperService.Map<PaymentTransactionForReport, PaymentTransaction>(paymentTransactionForReport);
        var processedTransaction = await ProcessTransaction(paymentTransaction, transactionId);
        UnitOfWork.PaymentTransactionRepository.Attach(processedTransaction);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            return MapperService.Map<PaymentTransaction, PaymentTransactionResponse>(processedTransaction);
        }

        return null;
    }

    public async Task<PaymentTransaction> ProcessTransaction(PaymentTransaction paymentTransaction, int paymentTransactionId)
    {
        var transactionReport = await GetPaymentReport(paymentTransactionId);
        if (transactionReport != null)
        {
            try
            {
                MapperService.Map(transactionReport, paymentTransaction);
                if (paymentTransaction.TransactionMethod == (byte)PaymentMethod.Online)
                {
                    SetPaymentStatus(paymentTransaction, transactionReport.TrnMessageId);
                }

                if (paymentTransaction.PaymentStatus == (byte)PaymentStatus.ApprovedOrPaid)
                {
                    await CompleteDisputeFeePayment(paymentTransaction);
                }
            }
            catch (Exception e)
            {
                throw new Exception(e.Message);
            }
        }

        return paymentTransaction;
    }

    public async Task<PaymentTransactionForReport> GetByIdAsync(int transactionId)
    {
        var paymentTransaction = await UnitOfWork.PaymentTransactionRepository
            .GetNoTrackingByIdAsync(t => t.PaymentTransactionId == transactionId);
        if (paymentTransaction != null)
        {
            return MapperService.Map<PaymentTransaction, PaymentTransactionForReport>(paymentTransaction);
        }

        return null;
    }

    public async Task<PaymentTransaction> GetNoTrackingPaymentTransactionAsync(int paymentTransactionId)
    {
        var paymentTransaction = await UnitOfWork.PaymentTransactionRepository.GetNoTrackingByIdAsync(
            c => c.PaymentTransactionId == paymentTransactionId);
        return paymentTransaction;
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object paymentTransactionId)
    {
        var lastModifiedDate = await UnitOfWork.PaymentTransactionRepository.GetLastModifiedDate((int)paymentTransactionId);

        return lastModifiedDate;
    }

    private static void SetPaymentStatus(PaymentTransaction paymentTransaction, string transactionReportTrnMessageId)
    {
        switch (transactionReportTrnMessageId)
        {
            case TrnMessageIdApproved:
                paymentTransaction.PaymentStatus = (byte)PaymentStatus.ApprovedOrPaid;
                break;
            case TrnMessageIdRejected:
            case TrnMessageIdRejectedEx:
                paymentTransaction.PaymentStatus = (byte)PaymentStatus.Rejected;
                break;
        }
    }

    private async Task<string> GeneratePaymentUrl(int paymentTransactionId, Guid disputeGuid, decimal? amountDue, byte? feeType, byte? transactionSiteSource)
    {
        await InitializeSettings();
        var returnUrl = string.Empty;

        switch (transactionSiteSource)
        {
            case (byte?)TransactionSiteSource.Intake:
                if (feeType == (byte?)DisputeFeeType.Intake)
                {
                    returnUrl = _returnUrlIntake;
                }

                if (feeType == (byte?)DisputeFeeType.LandlordIntake)
                {
                    returnUrl = _returnUrlAddLandlordIntake;
                }

                break;
            case (byte?)TransactionSiteSource.DisputeAccess:
                returnUrl = _returnUrlDisputeAccess;
                break;
            case (byte?)TransactionSiteSource.OfficeSubmission:
                returnUrl = _returnUrlOfficeSubmission;
                break;
        }

        var ref1 = $"{returnUrl}?Dispute={disputeGuid}&TransactionId={paymentTransactionId}";
        var encodedRef1 = HttpUtility.UrlEncode(ref1);
        var query = $"merchant_id={_merchantId}&trnAmount={amountDue}&trnOrderNumber={paymentTransactionId}&ref1={encodedRef1}";

        var urlToHash = query + _hashKey;
        var hashValue = HashHelper.GetMd5Hash(urlToHash);

        var fullQuery = $"{query}&hashValue={hashValue}";

        var bamboraGatewayUrl = _gatewayBaseUrl + "?" + fullQuery;
        return bamboraGatewayUrl;
    }

    private async Task<BamboraTransaction> GetPaymentReport(int paymentTransactionId)
    {
        await InitializeSettings();

        var query = $"requestType=BACKEND&merchant_id={_merchantId}&trnType=Q&trnOrderNumber={paymentTransactionId}";
        var urlToHash = query + _hashKey;
        var hashValue = HashHelper.GetMd5Hash(urlToHash);
        var fullQuery = $"{query}&hashValue={hashValue}";
        var reportingQuery = _reportingBaseUrl + fullQuery;

        var client = new HttpClient();
        var response = await client.GetStringAsync(reportingQuery);

        var transaction = CsvHelper.GetTransactionFromResponse(response);
        return transaction;
    }

    private async System.Threading.Tasks.Task CompleteDisputeFeePayment(PaymentTransaction transaction)
    {
        var disputeFee =
            await UnitOfWork.DisputeFeeRepository.GetByIdAsync(transaction.DisputeFeeId);
        disputeFee.IsPaid = true;
        disputeFee.MethodPaid = transaction.TransactionMethod;
        disputeFee.AmountPaid = transaction.TransactionAmount;
        if (transaction.TrnDate != null)
        {
            disputeFee.DatePaid = transaction.TrnDate.Value.ToUniversalTime();
        }

        UnitOfWork.DisputeFeeRepository.Attach(disputeFee);
        var result = await UnitOfWork.Complete();
        if (result.CheckSuccess())
        {
            var message = new EmailGenerateIntegrationEvent
            {
                DisputeGuid = disputeFee.DisputeGuid,
                MessageType = EmailMessageType.Notification,
                AssignedTemplateId = AssignedTemplate.PaymentSubmitted
            };

            if (disputeFee.PayorId != null)
            {
                message.ParticipantId = (int)disputeFee.PayorId;
            }

            Publish(message);
        }
    }

    private async System.Threading.Tasks.Task InitializeSettings()
    {
        _merchantId = await SystemSettingsService.GetValueAsync<string>(SettingKeys.MerchantId);
        _hashKey = await SystemSettingsService.GetValueAsync<string>(SettingKeys.HashKey);
        _returnUrlIntake = await SystemSettingsService.GetValueAsync<string>(SettingKeys.ReturnUrlIntake);
        _returnUrlAddLandlordIntake = await SystemSettingsService.GetValueAsync<string>(SettingKeys.ReturnUrlAddLandlordIntake);
        _returnUrlDisputeAccess = await SystemSettingsService.GetValueAsync<string>(SettingKeys.ReturnUrlDisputeAccess);
        _returnUrlOfficeSubmission = await SystemSettingsService.GetValueAsync<string>(SettingKeys.ReturnUrlOfficeSubmission);
        _gatewayBaseUrl = await SystemSettingsService.GetValueAsync<string>(SettingKeys.PaymentUri);
        _reportingBaseUrl = await SystemSettingsService.GetValueAsync<string>(SettingKeys.PaymentReportUri);
    }

    private async Task<int> GetLastPaymentTransactionId(int disputeFeeId)
    {
        var lastTransactionId = await UnitOfWork.PaymentTransactionRepository.GetLastTransactionId(disputeFeeId);
        return lastTransactionId;
    }

    private void Publish(EmailGenerateIntegrationEvent message)
    {
        Bus.PubSub.PublishAsync(message)
            .ContinueWith(task =>
            {
                if (task.IsCompleted)
                {
                    Log.Information("Publish email generation event: {DisputeGuid} {MessageType}", message.DisputeGuid, message.MessageType);
                }

                if (task.IsFaulted)
                {
                    Log.Error(task.Exception, "CorrelationGuid = {CorrelationGuid}", message.CorrelationGuid);
                    throw new Exception($"Message = {message.CorrelationGuid} exception", task.Exception);
                }
            });
    }
}