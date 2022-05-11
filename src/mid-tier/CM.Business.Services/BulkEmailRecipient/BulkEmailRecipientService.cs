using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.BulkEmailRecipient;
using CM.Business.Entities.SharedModels;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using MailKit.Net.Smtp;
using MimeKit;
using Serilog;

namespace CM.Business.Services.BulkEmailRecipient;

public class BulkEmailRecipientService : CmServiceBase, IBulkEmailRecipientService
{
    private readonly ILogger _logger;

    public BulkEmailRecipientService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
        var appDataFolderPath = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
        FileUtils.CheckIfNotExistsCreate(appDataFolderPath + "/logs");

        var logFilePath = Path.Combine(appDataFolderPath + "/logs/", @"BulkEmailsSent.txt");
        _logger = new LoggerConfiguration()
            .Enrich.FromLogContext()
            .WriteTo.File(logFilePath)
            .CreateLogger();
    }

    public async Task<string> CreateAsync(BulkEmailRecipientRequest request)
    {
        var createdEmailMessagesCount = 0;

        var bulkEmailRecipients = await UnitOfWork.BulkEmailRecipientRepository.GetBulkEmailRecipients(request.BulkEmailBatchId);

        var last = bulkEmailRecipients.Last();
        foreach (var bulkEmailRecipient in bulkEmailRecipients)
        {
            try
            {
                var template = await UnitOfWork.EmailTemplateRepository.GetByIdAsync(request.EmailTemplateId);
                var body = template.TemplateHtml.Replace("{filenumber}", bulkEmailRecipient.AssociatedFileNumber.ToString());
                var subject = request.EmailSubject.Replace("{filenumber}", bulkEmailRecipient.AssociatedFileNumber.ToString());

                var isSent = await SendMail(string.Empty, request.ReplyEmailAddress, bulkEmailRecipient.RecipientEmailAddress, subject, body);

                if (isSent)
                {
                    var newEmailMessage = new EmailMessage
                    {
                        DisputeGuid = bulkEmailRecipient.AssociatedDisputeGuid,
                        ParticipantId = bulkEmailRecipient.RecipientParticipantId,
                        MessageType = (byte)EmailMessageType.Manual,
                        AssignedTemplateId = AssignedTemplate.CustomEmailTemplateId,
                        EmailTo = bulkEmailRecipient.RecipientEmailAddress,
                        EmailFrom = request.ReplyEmailAddress,
                        Subject = subject,
                        HtmlBody = body,
                        BodyType = (byte)EmailMessageBodyType.Html,
                        IsActive = false,
                        SendStatus = (byte)EmailStatus.Sent,
                        SentDate = DateTime.UtcNow,
                        IsDeleted = false
                    };

                    await UnitOfWork.EmailMessageRepository.InsertAsync(newEmailMessage);
                    await UnitOfWork.Complete();

                    createdEmailMessagesCount += 1;

                    _logger.Information("Batch ID: {BulkEmailBatchId} - File Number {AssociatedFileNumber} - {RecipientEmailAddress} - {newEmailMessage.SentDate} - Sent and stored in dispute", bulkEmailRecipient.BulkEmailBatchId, bulkEmailRecipient.AssociatedFileNumber, bulkEmailRecipient.RecipientEmailAddress, newEmailMessage.SentDate);

                    if (bulkEmailRecipient == last)
                    {
                        Log.Information("Batch ID {BulkEmailBatchId} - Process completed - {UtcNow}", bulkEmailRecipient.BulkEmailBatchId, DateTime.UtcNow);
                    }
                }
                else
                {
                    _logger.Information("Batch ID: {BulkEmailBatchId} - File Number - {AssociatedFileNumber} - {RecipientEmailAddress} - {UtcNow} - Error See Logs", bulkEmailRecipient.BulkEmailBatchId, bulkEmailRecipient.AssociatedFileNumber, bulkEmailRecipient.RecipientEmailAddress, DateTime.UtcNow);
                }
            }
            catch (Exception)
            {
                _logger.Information("Batch ID: {BulkEmailBatchId} - File Number - {AssociatedFileNumber} - {RecipientEmailAddress} - {UtcNow} - Error See Logs", bulkEmailRecipient.BulkEmailBatchId, bulkEmailRecipient.AssociatedFileNumber, bulkEmailRecipient.RecipientEmailAddress, DateTime.UtcNow);
            }
        }

        return $"{createdEmailMessagesCount} Emails will be processed in batch";
    }

    public async Task<DateTime?> GetLastModifiedDateAsync(object id)
    {
        var bulkEmailRecipientLastModified = await UnitOfWork.BulkEmailRecipientRepository.GetLastModifiedDateAsync((int)id);
        return bulkEmailRecipientLastModified;
    }

    public async Task<bool> IsBulkEmailBatchIdExist(int bulkEmailBatchId)
    {
        var bulkEmailRecipient = await UnitOfWork.BulkEmailRecipientRepository.IsAnyBulkEmailBatchId(bulkEmailBatchId);
        return bulkEmailRecipient;
    }

    private async Task<bool> SendMail(string title, string emailFrom, string emailTo, string subject, string body)
    {
        using var client = new SmtpClient();

        try
        {
            var mimeMessage = new MimeMessage();
            mimeMessage.From.Add(
                title == string.Empty ? MailboxAddress.Parse(emailFrom) : new MailboxAddress(title, emailFrom));

            mimeMessage.To.Add(MailboxAddress.Parse(emailTo));

            mimeMessage.Subject = subject;

            var builder = new BodyBuilder { TextBody = body, HtmlBody = body };

            mimeMessage.Body = builder.ToMessageBody();

            client.ServerCertificateValidationCallback = (_, _, _, _) => true;

            var emailConfiguration = await GetConfig();

            client.Timeout = emailConfiguration.Timeout;

            await client.ConnectAsync(emailConfiguration.Host, emailConfiguration.Port);

            if (!string.IsNullOrWhiteSpace(emailConfiguration.User) && !string.IsNullOrWhiteSpace(emailConfiguration.Password))
            {
                await client.AuthenticateAsync(emailConfiguration.User, emailConfiguration.Password);
            }

            await client.SendAsync(mimeMessage);

            await client.DisconnectAsync(true);
        }
        catch (Exception exc)
        {
            _logger.Error(exc, "SMTP Exception");
            throw;
        }

        return true;
    }

    private async Task<EmailConfiguration> GetConfig()
    {
        var password = string.Empty;
        var user = await GetSettingAsync<string>(SettingKeys.SmtpClientUsername);
        if (!string.IsNullOrWhiteSpace(user))
        {
            var encryptedPassword = await GetSettingAsync<string>(SettingKeys.SmtpClientPassword);
            password = HashHelper.DecryptPassword(encryptedPassword, user);
        }

        var emailConfiguration = new EmailConfiguration
        {
            Host = await GetSettingAsync<string>(SettingKeys.SmtpClientHost),
            Port = await GetSettingAsync<int>(SettingKeys.SmtpClientPort),
            EnableSsl = await GetSettingAsync<bool>(SettingKeys.SmtpClientEnableSsl),
            Timeout = await GetSettingAsync<int>(SettingKeys.SmtpClientTimeout),
            User = user,
            Password = password,
            FileStorageRoot = await GetSettingAsync<string>(SettingKeys.FileStorageRoot),
            CommonFileStorageRoot = await GetSettingAsync<string>(SettingKeys.CommonFileStorageRoot)
        };

        return emailConfiguration;
    }

    private async Task<T> GetSettingAsync<T>(string key)
    {
        var setting = await UnitOfWork.SystemSettingsRepository.GetSetting(key);
        return (T)Convert.ChangeType(setting.Value, typeof(T));
    }
}