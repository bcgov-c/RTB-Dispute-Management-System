using System;
using System.Threading;
using System.Threading.Tasks;
using CM.Business.Services.SystemSettingsService;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.FileSystem.Service;
using CM.Messages.EmailNotification.Events;
using CM.Messages.Validation;
using CM.ServiceBase;
using CM.Services.EmailNotification.EmailNotificationService.Configuration;
using CM.Services.EmailNotification.EmailNotificationService.Utils;
using EasyNetQ.AutoSubscribe;
using MimeKit;
using Serilog;
using File = System.IO.File;
using Task = System.Threading.Tasks.Task;

namespace CM.Services.EmailNotification.EmailNotificationService.IntegrationEvents.EventHandling;

public class EmailNotificationIntegrationEventHandler : IConsumeAsync<EmailNotificationIntegrationEvent>
{
    private readonly ILogger _logger;
    private readonly ISystemSettingsService _systemSettingsService;
    private readonly IUnitOfWork _unitOfWork;

    public EmailNotificationIntegrationEventHandler(IUnitOfWork unitOfWork, ILogger logger, ISystemSettingsService systemSettingsService)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _systemSettingsService = systemSettingsService;
    }

    [AutoSubscriberConsumer(SubscriptionId = "EmailNotification")]
    public async Task ConsumeAsync(EmailNotificationIntegrationEvent message, CancellationToken cancellationToken = default)
    {
        message.Validate();

        var log = _logger.ForContext("CorrelationGuid", message.CorrelationGuid);

        log.EventMessage("Email Notification Integration Event Received", message);

        try
        {
            var mimeMessage = await CreateMimeMessage(message);
            var configuration = await EmailConfiguration.GetConfiguration(_unitOfWork);
            var retValue = await SendMail(mimeMessage, configuration);
            if (retValue)
            {
                await ArchiveEmailNotification(message, EmailStatus.Sent);
            }
        }
        catch (Exception exc)
        {
            log.EventMessageException(exc, "Email Notification Integration Event Failed", message);
            await ArchiveEmailNotification(message, EmailStatus.Error);
            throw;
        }

        log.EventMessage("Email Notification Integration Event Archived", message);
    }

    private async Task<MimeMessage> CreateMimeMessage(EmailNotificationIntegrationEvent message)
    {
        var mimeMessage = new MimeMessage();
        mimeMessage.From.Add(new MailboxAddress(message.Title, message.EmailFrom));
        mimeMessage.To.Add(MailboxAddress.Parse(message.EmailTo));

        mimeMessage.Subject = message.Subject;

        var builder = new BodyBuilder { TextBody = message.Body, HtmlBody = message.Body };

        if (message.EmailAttachments != null)
        {
            foreach (var item in message.EmailAttachments)
            {
                switch (item.AttachmentType)
                {
                    case AttachmentType.Dispute:
                        var file = await _unitOfWork.FileRepository.GetByIdAsync(item.FileId);
                        var fileContext = FileContextFactory.GetStorageFromFileStorageType(file.Storage, _systemSettingsService);
                        var filePath = await fileContext.GetFilePath(file.FilePath);
                        await using (var fs = File.OpenRead(filePath))
                        {
                            await builder.Attachments.AddAsync(file.FileName, fs);
                        }

                        break;

                    case AttachmentType.Common:
                        var commonFile = await _unitOfWork.CommonFileRepository.GetByIdAsync(item.FileId);
                        var commonFileContext = FileContextFactory.GetCommonStorageFromFileStorageType(StorageType.File, _systemSettingsService);
                        var commonFilePath = await commonFileContext.GetFilePath(commonFile.FilePath);
                        await using (var fs = File.OpenRead(commonFilePath))
                        {
                            await builder.Attachments.AddAsync(commonFile.FileName, fs);
                        }

                        break;
                    default:
                        throw new ArgumentOutOfRangeException();
                }
            }
        }

        mimeMessage.Body = builder.ToMessageBody();

        return mimeMessage;
    }

    private async Task<bool> SendMail(MimeMessage mimeMessage, EmailConfiguration emailConfiguration)
    {
        try
        {
            await EmailSmtp.SendSmtpAsync(mimeMessage, emailConfiguration, _logger);
        }
        catch (Exception exc)
        {
            _logger.Error(exc, "SMTP unknown error: {Message}", exc.Message);
            throw;
        }

        return true;
    }

    private async Task ArchiveEmailNotification(EmailNotificationIntegrationEvent message, EmailStatus status)
    {
        var success = status is EmailStatus.Sent or EmailStatus.PickedUp;

        var emailMessageToUpdate = await _unitOfWork.EmailMessageRepository.GetEmailByMessageGuid(message.MessageGuid);
        if (emailMessageToUpdate != null)
        {
            emailMessageToUpdate.SendStatus = (byte)status;
            emailMessageToUpdate.SentDate = success ? DateTime.UtcNow : null;
            emailMessageToUpdate.Retries += 1;
            _unitOfWork.EmailMessageRepository.Update(emailMessageToUpdate);
            await _unitOfWork.Complete();
        }
        else
        {
            var emailMessage = new EmailMessage
            {
                MessageGuid = message.MessageGuid,
                DisputeGuid = message.DisputeGuid,
                SendStatus = (byte)status,
                PreferredSendDate = DateTime.UtcNow,
                SentDate = success ? DateTime.UtcNow : null,
                EmailTo = message.EmailTo,
                EmailFrom = message.EmailFrom,
                ParticipantId = message.ParticipantId,
                HtmlBody = message.Body,
                Subject = message.Subject,
                MessageType = message.MessageType,
                AssignedTemplateId = message.AssignedTemplateId,
                IsActive = false,
                Retries = 0,
                CreatedDate = DateTime.UtcNow,
                ModifiedDate = DateTime.UtcNow,
                IsDeleted = false,
                CreatedBy = Constants.UndefinedUserId,
                ModifiedBy = Constants.UndefinedUserId
            };

            await _unitOfWork.EmailMessageRepository.InsertAsync(emailMessage);
            await _unitOfWork.Complete();
        }
    }
}