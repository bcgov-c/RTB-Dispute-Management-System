using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;
using CM.FTP;
using CM.Messages.ReconciliationReportSender.Events;
using CM.Messages.Validation;
using CM.ServiceBase;
using EasyNetQ.AutoSubscribe;
using Serilog;

namespace CM.Services.ReconciliationReportSender.ReconciliationReportSenderService.IntegrationEvents.EventHandling;

public class ReconciliationReportSenderEventHandler : IConsumeAsync<ReconciliationReportSenderEvent>
{
    private readonly ILogger _logger;
    private readonly IUnitOfWork _unitOfWork;

    public ReconciliationReportSenderEventHandler(IUnitOfWork unitOfWork, ILogger logger)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    private string Host { get; set; }

    private string Username { get; set; }

    private string Password { get; set; }

    private string FolderRoot { get; set; }

    private string EgarmsFtpSubString { get; set; }

    [AutoSubscriberConsumer(SubscriptionId = "ReconciliationReportSender")]
    public async Task ConsumeAsync(ReconciliationReportSenderEvent message, CancellationToken cancellationToken = default)
    {
        message.Validate();

        var log = _logger.ForContext("CorrelationGuid", message.CorrelationGuid);
        log.EventMessage("Reconciliation Report Sender Integration Event Received", message);

        var isSent = await SendFile(message.FileName);
        if (isSent)
        {
            await UpdateTransactions(ReconcileStatus.Reconciled, message.PaymentTransactionIds);
            MoveToFolder(message.FileName, Folders.Sent);
            log.EventMessage("Reconciliation Report Sent", message);
        }
        else
        {
            await UpdateTransactions(ReconcileStatus.FailedToSend, message.PaymentTransactionIds);
            MoveToFolder(message.FileName, Folders.Failed);
            log.EventMessage("Reconciliation Report Send Failed", message);
        }
    }

    private async Task SetupSettings()
    {
        var host = await _unitOfWork.SystemSettingsRepository.GetSetting(SettingKeys.EgarmsHost);
        Host = host.Value;
        var userName = await _unitOfWork.SystemSettingsRepository.GetSetting(SettingKeys.EgarmsUsername);
        Username = userName.Value;
        var password = await _unitOfWork.SystemSettingsRepository.GetSetting(SettingKeys.EgarmsPassword);
        Password = password.Value;
        var folderRoot = await _unitOfWork.SystemSettingsRepository.GetSetting(SettingKeys.EgarmsFoldersRoot);
        FolderRoot = folderRoot.Value;
        var eGarmsFtpSubString = await _unitOfWork.SystemSettingsRepository.GetSetting(SettingKeys.EgarmsFtpSubString);
        EgarmsFtpSubString = eGarmsFtpSubString.Value;
    }

    private async Task<bool> SendFile(string fileName)
    {
        try
        {
            await SetupSettings();
            var fileRoot = Path.Combine(FolderRoot, Folders.ToSend);

            var filePath = Path.Combine(fileRoot, fileName);

            var remoteFileName = $"'{EgarmsFtpSubString}" + fileName + "'";

            var ftpUri = new Uri(Host);
            var credentials = new NetworkCredential(Username, Password);
            Log.Information("Upload File Started. Path: {HostNameWithFolder}", remoteFileName);

            var ftpStatus = await FtpProxy.UploadFileAsync(ftpUri, remoteFileName, credentials, filePath);

            Log.Information("Upload File Complete, status {StatusDescription}", ftpStatus);
            return true;
        }
        catch (WebException webExc)
        {
            var status = ((FtpWebResponse)webExc.Response)?.StatusDescription;
            Log.Error("Upload file has been failed. Status: {Status}", status);
            return false;
        }
        catch (Exception exc)
        {
            Log.Error("Upload has been failed. Message: {Message}, {StackTrace}", exc.Message, exc.StackTrace);
            return false;
        }
    }

    private void MoveToFolder(string fileName, string destinationFolder)
    {
        var finalFileName = new StringBuilder(fileName);
        var currentDate = DateTime.UtcNow;
        finalFileName.Append('_');
        finalFileName.Append(currentDate.ToString("MM"));
        finalFileName.Append(currentDate.ToString("dd"));
        finalFileName.Append(currentDate.ToString("yyyy"));
        finalFileName.Append('_');
        finalFileName.Append(currentDate.TimeOfDay.TotalSeconds.ToString("0000"));
        var sourceFileFolder = Path.Combine(FolderRoot, Folders.ToSend);
        var sourceFile = Path.Combine(sourceFileFolder, fileName);
        var destinationFileFolder = Path.Combine(FolderRoot, destinationFolder);
        var destinationFile = Path.Combine(destinationFileFolder, finalFileName.ToString());

        File.Move(sourceFile, destinationFile);
    }

    private async Task UpdateTransactions(ReconcileStatus status, IEnumerable<int> transactionIds)
    {
        foreach (var transactionId in transactionIds)
        {
            var transaction = await _unitOfWork.PaymentTransactionRepository.GetByIdAsync(transactionId);

            transaction.ReconcileStatus = (byte?)status;
            transaction.ReconcileDate = DateTime.UtcNow;

            _unitOfWork.PaymentTransactionRepository.Update(transaction);
            await _unitOfWork.Complete();
        }
    }
}