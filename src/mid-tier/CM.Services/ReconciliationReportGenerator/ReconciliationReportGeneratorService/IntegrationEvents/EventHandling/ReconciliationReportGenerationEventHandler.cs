using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.Messages.ReconciliationReportGenerator.Events;
using CM.Messages.ReconciliationReportSender.Events;
using CM.Messages.Validation;
using CM.ServiceBase;
using Diacritics.Extensions;
using EasyNetQ;
using EasyNetQ.AutoSubscribe;
using FluentAssertions;
using Serilog;
using Task = System.Threading.Tasks.Task;

namespace CM.Services.ReconciliationReportGenerator.ReconciliationReportGeneratorService.IntegrationEvents.EventHandling;

public class ReconciliationReportGenerationEventHandler : IConsumeAsync<ReconciliationReportGenerationEvent>
{
    private readonly IBus _bus;
    private readonly ILogger _logger;
    private readonly IUnitOfWork _unitOfWork;

    public ReconciliationReportGenerationEventHandler(IBus bus, IUnitOfWork unitOfWork, ILogger logger)
    {
        _bus = bus;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    [AutoSubscriberConsumer(SubscriptionId = "ReconciliationReportGeneration")]
    public async Task ConsumeAsync(ReconciliationReportGenerationEvent message, CancellationToken cancellationToken = default)
    {
        message.Validate();

        var log = _logger.ForContext("CorrelationGuid", message.CorrelationGuid);
        log.EventMessage("Reconciliation Report Generation Integration Event Received", message);

        await EnsureFoldersAreCreated();

        var paymentTransactions = await _unitOfWork.PaymentTransactionRepository.GetTransactionsForReconciliations();
        if (paymentTransactions != null)
        {
            await BuildReport(paymentTransactions.Count, paymentTransactions, message);
            log.EventMessage($"Reconciliation Report Send Integration Event Published. Records count: {paymentTransactions.Count}", message);
        }
        else
        {
            log.EventMessage("No payment transaction found", message);
        }
    }

    private async Task BuildReport(int recordsCount, List<PaymentTransaction> transactions, ReconciliationReportGenerationEvent message)
    {
        const string fileName = "INPUT(+1)";

        await GenerateReport(transactions, recordsCount, fileName);
        var reconciliationReportSenderMessage = new ReconciliationReportSenderEvent
        {
            CorrelationGuid = message.CorrelationGuid,
            FileName = fileName,
            PaymentTransactionIds = transactions.Select(p => p.PaymentTransactionId).ToList()
        };

        Publish(reconciliationReportSenderMessage);
    }

    private async Task GenerateReport(List<PaymentTransaction> transactions, int recordsCount, string fileName)
    {
        var folderRoot = await _unitOfWork.SystemSettingsRepository.GetSetting(SettingKeys.EgarmsFoldersRoot);
        var filePath = $"{folderRoot.Value}/ToSend/{fileName}";

        var report = await GenerateBodyForReport(transactions, recordsCount);

        System.IO.File.Delete(filePath);
        await System.IO.File.AppendAllTextAsync(filePath, report);
    }

    private async Task<string> GenerateBodyForReport(IReadOnlyCollection<PaymentTransaction> transactions, int recordsCount)
    {
        const char emptyPadding = ' ';
        const int headerBlankFillerLength = 86;
        const int blankFilterLength = 26;
        const int payerNameMaxLength = 25;
        const int fileNumberPaddingCount = 35;
        const int cardTypeMaxLength = 35;
        const string recordCountFormat = "0000";
        const string dateFormat = "yyyyMMddHHmmss";
        const string headerPrefix = "H01400";
        const string rowPrefix = "D409000001";
        var allowedCardTypes = new[] { "MC", "VI", "AM", "PV", "MD" };

        var stringBuilder = new StringBuilder();
        try
        {
            var date = DateTime.Now;

            var header = new StringBuilder();
            header
                .Append(headerPrefix)
                .Append(date.ToString(dateFormat))
                .Append(recordsCount.ToString(recordCountFormat))
                .Append(emptyPadding, headerBlankFillerLength);

            header.ToString().Should().HaveLength(110);

            stringBuilder.Append(header);
            foreach (var transaction in transactions)
            {
                if (transaction.TransactionBy != null)
                {
                    var payer = await _unitOfWork.ParticipantRepository.GetByIdAsync((int)transaction.TransactionBy);
                    if (payer != null)
                    {
                        string payerName;
                        if (payer.FirstName != null && payer.LastName != null)
                        {
                            payerName = payer.FirstName + " " + payer.LastName;
                        }
                        else
                        {
                            payerName = payer.BusinessContactFirstName + payer.BusinessContactLastName;
                        }

                        payerName = payerName.ToAlphaNumeric().RemoveDiacritics();

                        var fileNumber = await _unitOfWork.DisputeRepository.GetFileNumber(payer.DisputeGuid);

                        stringBuilder.Append(Environment.NewLine);

                        var transactionAmount = $"{transaction.TransactionAmount:0000000000.00}";
                        var payerNameFormatted = payerName.Truncate(payerNameMaxLength);
                        var cardTypeFormatted = transaction.CardType.Truncate(cardTypeMaxLength);

                        if (!allowedCardTypes.Contains(cardTypeFormatted))
                        {
                            _logger.Warning("Not supported card type {CardTypeFormatted} in PaymentTransactionId {PaymentTransactionId}", cardTypeFormatted, transaction.PaymentTransactionId);
                        }

                        var rowString = $"{rowPrefix}" +
                                        $"{transactionAmount}" +
                                        $"{emptyPadding, blankFilterLength}" +
                                        $"{payerNameFormatted, -payerNameMaxLength}" +
                                        $"{fileNumber, -fileNumberPaddingCount}" +
                                        $"{cardTypeFormatted}";

                        rowString.Should().HaveLength(111);
                        stringBuilder.Append(rowString);
                        transaction.ReconcileStatus = (byte?)ReconcileStatus.SendingReport;
                        transaction.ReconcileDate = DateTime.UtcNow;
                        _unitOfWork.PaymentTransactionRepository.Attach(transaction);
                    }
                    else
                    {
                        _logger.Warning("Payor not found for Participant: {TransactionBy}", transaction.TransactionBy);
                    }
                }
            }

            await _unitOfWork.Complete();
        }
        catch (Exception exception)
        {
            foreach (var transaction in transactions)
            {
                transaction.ReconcileStatus = (byte?)ReconcileStatus.FailedToGenerate;
                transaction.ReconcileDate = DateTime.UtcNow;
                _unitOfWork.PaymentTransactionRepository.Attach(transaction);
                await _unitOfWork.Complete();
            }

            _logger.Error(exception, "Reconciliation Report Generation");
            throw;
        }

        return stringBuilder.ToString();
    }

    private async Task EnsureFoldersAreCreated()
    {
        var folderRoot = await _unitOfWork.SystemSettingsRepository.GetSetting(SettingKeys.EgarmsFoldersRoot);
        if (folderRoot != null)
        {
            var toSend = Path.Combine(folderRoot.Value, Folders.ToSend);
            var toSendExists = Directory.Exists(toSend);
            if (!toSendExists)
            {
                Directory.CreateDirectory(toSend);
            }

            var sent = Path.Combine(folderRoot.Value, Folders.Sent);
            var sentExists = Directory.Exists(sent);
            if (!sentExists)
            {
                Directory.CreateDirectory(sent);
            }

            var failed = Path.Combine(folderRoot.Value, Folders.Failed);
            var failedExists = Directory.Exists(failed);
            if (!failedExists)
            {
                Directory.CreateDirectory(failed);
            }
        }
    }

    private void Publish(ReconciliationReportSenderEvent message)
    {
        _bus.PubSub.PublishAsync(message)
            .ContinueWith(task =>
            {
                if (task.IsCompleted)
                {
                    _logger.Information("Publish reconciliation sender event: {FileName}", message.FileName);
                }
                if (task.IsFaulted)
                {
                    _logger.Error(task.Exception, "Publish reconciliation fails");
                }
            });
    }
}