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
using CM.Messages.EmailGenerator.Events;
using CM.Messages.EmailNotification.Events;
using CM.Messages.Validation;
using CM.ServiceBase;
using CM.ServiceBase.Exceptions;
using CM.Services.EmailGenerator.EmailGeneratorService.EmailTemplateHandler;
using CM.Services.EmailGenerator.EmailGeneratorService.Tags;
using EasyNetQ;
using EasyNetQ.AutoSubscribe;
using Serilog;

namespace CM.Services.EmailGenerator.EmailGeneratorService.IntegrationEvents.EventHandling;

public class EmailGenerateIntegrationEventHandler : IConsumeAsync<EmailGenerateIntegrationEvent>
{
    private readonly IBus _bus;
    private readonly ILogger _logger;
    private readonly IUnitOfWork _unitOfWork;

    public EmailGenerateIntegrationEventHandler(IBus bus, IUnitOfWork unitOfWork, ILogger logger)
    {
        _unitOfWork = unitOfWork;
        _bus = bus;
        _logger = logger;
    }

    [AutoSubscriberConsumer(SubscriptionId = "EmailGeneration")]
    public async System.Threading.Tasks.Task ConsumeAsync(EmailGenerateIntegrationEvent message, CancellationToken cancellationToken = default)
    {
        message.Validate();

        var log = _logger.ForContext("CorrelationGuid", message.CorrelationGuid);

        log.EventMessage("Email Generate Integration Event Received", message);

        var emailTemplate = await _unitOfWork.EmailTemplateRepository.GetByEmailTypeAsync(message.AssignedTemplateId);
        if (emailTemplate == null)
        {
            throw new InvalidDataException($"No mail template found for email message type {message.AssignedTemplateId}");
        }

        var participants = await GetRecipientParticipantsAsync(message);
        foreach (var participant in participants.Where(participant => !string.IsNullOrWhiteSpace(participant?.Email)))
        {
            try
            {
                var emailNotificationIntegrationEvent = new EmailNotificationIntegrationEvent
                {
                    CorrelationGuid = message.CorrelationGuid,
                    Title = "RTB DMS Notification",
                    DisputeGuid = message.DisputeGuid,
                    PreferredSendDate = DateTime.UtcNow,
                    EmailTo = participant.Email,
                    EmailFrom = emailTemplate.ReplyEmailAddress,
                    Body = await BuildEmailMessageBody(emailTemplate.TemplateHtml, message, participant),
                    Subject = await BuildEmailMessageSubject(emailTemplate.SubjectLine, message),
                    MessageType = (byte)message.MessageType,
                    AssignedTemplateId = emailTemplate.AssignedTemplateId,
                    ParticipantId = participant.ParticipantId
                };

                Publish(emailNotificationIntegrationEvent);

                log.EventMessage("Email Notification Integration Event Published", emailNotificationIntegrationEvent);
            }
            catch (TagNotFoundException exception)
            {
                var failedEmailMessage = new EmailMessage
                {
                    MessageGuid = Guid.NewGuid(),
                    DisputeGuid = message.DisputeGuid,
                    MessageType = (byte)message.MessageType,
                    AssignedTemplateId = emailTemplate.AssignedTemplateId,
                    EmailTo = participant.Email,
                    EmailFrom = emailTemplate.ReplyEmailAddress,
                    BodyType = (byte)EmailMessageBodyType.Html,
                    Subject = await BuildEmailMessageSubject(emailTemplate.SubjectLine, message),
                    HtmlBody = emailTemplate.TemplateHtml,
                    SendStatus = (byte?)EmailStatus.MergeError,
                    SendStatusMessage = exception.Tag,
                    IsActive = false,
                    Retries = 0
                };

                await _unitOfWork.EmailMessageRepository.InsertAsync(failedEmailMessage);
                await _unitOfWork.Complete();

                log.Error(exception, "Email not generated. Tag could not be replaced");
            }
        }
    }

    // ReSharper disable once ParameterOnlyUsedForPreconditionCheck.Local
    private static void CheckTags(string htmlBody)
    {
        var tags = TagDictionary.GetAllTagValues();
        foreach (var tag in tags)
        {
            if (htmlBody.Contains(tag))
            {
                throw new TagNotFoundException($"{tag} has not appropriate data to be replaced", tag);
            }
        }
    }

    private async Task<List<Participant>> GetRecipientParticipantsAsync(EmailGenerateIntegrationEvent request)
    {
        var recipientParticipants = new List<Participant>();

        switch (request.AssignedTemplateId)
        {
            case AssignedTemplate.ParticipatoryApplicationSubmitted:
            case AssignedTemplate.DisputeAbandonedForNoPaymentWithEmail:
            case AssignedTemplate.ParticipatoryDisputePaymentWaitingForFeeWaiverProof:
            case AssignedTemplate.ParticipatoryDisputeWaitingForOfficePayment:
            case AssignedTemplate.ParticipatoryApplicantEvidenceReminder:
            case AssignedTemplate.ParticipatoryUpdateSubmitted:
            case AssignedTemplate.DirectRequestApplicationSubmitted:
            case AssignedTemplate.DirectRequestOfficePaymentRequired:
            case AssignedTemplate.DirectRequestUpdateSubmitted:
            case AssignedTemplate.DisputeAbandonedDueToApplicantInaction:
            case AssignedTemplate.DisputeAbandonedDueToApplicantServiceInaction:
            case AssignedTemplate.AricParticipatoryApplicantEvidenceReminder:
            case AssignedTemplate.PfrParticipatoryApplicantEvidenceReminder:
            case AssignedTemplate.AricParticipatoryDisputeWaitingForOfficePayment:
            case AssignedTemplate.AricParticipatoryApplicationSubmitted:
            case AssignedTemplate.AricParticipatoryUpdateSubmitted:
            case AssignedTemplate.PfrParticipatoryDisputeWaitingForOfficePayment:
            case AssignedTemplate.PfrParticipatoryApplicationSubmitted:
            case AssignedTemplate.PfrParticipatoryUpdateSubmitted:
                var primaryApplicant = await _unitOfWork.ParticipantRepository.GetPrimaryApplicantAsync(request.DisputeGuid);
                recipientParticipants.Add(primaryApplicant);
                break;
            case AssignedTemplate.ParticipatoryRespondentEvidenceReminder:
            case AssignedTemplate.EmergRespondentEvidenceReminder:
                var respondents = await _unitOfWork.ParticipantRepository.GetRespondentsAsync(request.DisputeGuid);
                recipientParticipants.AddRange(respondents);
                break;
            case AssignedTemplate.ParticipatoryHearingReminder:
            case AssignedTemplate.DisputeWithdrawn:
            case AssignedTemplate.DisputeCancelled:
                var participants = await _unitOfWork.ParticipantRepository.GetDisputeParticipantsAsync(request.DisputeGuid);
                recipientParticipants.AddRange(participants);
                break;
            case AssignedTemplate.PaymentSubmitted:
            case AssignedTemplate.AccessCodeRecovery:
                var participant = await _unitOfWork.ParticipantRepository.GetByIdAsync(request.ParticipantId);
                recipientParticipants.Add(participant);
                break;
            default:
                throw new ArgumentOutOfRangeException();
        }

        recipientParticipants.RemoveAll(p =>
            p.ParticipantStatus == (byte)ParticipantStatus.Removed || p.ParticipantStatus == (byte)ParticipantStatus.Deleted);
        return recipientParticipants;
    }

    private async Task<string> BuildEmailMessageBody(string htmlBody, EmailGenerateIntegrationEvent request, Participant participant)
    {
        var dispute = await _unitOfWork.DisputeRepository.GetDisputeByGuidAsync(request.DisputeGuid);
        return await HandleEmailTemplates(htmlBody, dispute, participant);
    }

    private async Task<string> HandleEmailTemplates(string htmlBody, Dispute dispute, Participant participant)
    {
        AbstractEmailMessageHandler handler = new FileNumberHandler(_unitOfWork);
        handler
            .SetNext(new ApplicationEvidenceLaterListHandler(_unitOfWork))
            .SetNext(new DisputeAccessUrlHandler(_unitOfWork))
            .SetNext(new HearingDetailsHandler(_unitOfWork))
            .SetNext(new InitialSubmissionDateHandler(_unitOfWork))
            .SetNext(new IntakeUrlHandler(_unitOfWork))
            .SetNext(new NoticePackageDeliveryMethodHandler(_unitOfWork))
            .SetNext(new PaymentHandler(_unitOfWork))
            .SetNext(new PrimaryApplicantNameHandler(_unitOfWork))
            .SetNext(new RecipientAccessCodeHandler(_unitOfWork))
            .SetNext(new RentalUnitAddressHandler(_unitOfWork))
            .SetNext(new ThreeDaysFromTodayHandler(_unitOfWork));

        var stringBuilder = new StringBuilder(htmlBody);
        var htmlBodyBuilder = await handler.Handle(stringBuilder, dispute, participant);
        CheckTags(htmlBodyBuilder.ToString());
        return htmlBodyBuilder.ToString();
    }

    private async Task<string> BuildEmailMessageSubject(string subject, EmailGenerateIntegrationEvent request)
    {
        var dispute = await _unitOfWork.DisputeRepository.GetDisputeByGuidAsync(request.DisputeGuid);

        switch (request.AssignedTemplateId)
        {
            case AssignedTemplate.ParticipatoryApplicationSubmitted:
            case AssignedTemplate.DisputeAbandonedForNoPaymentWithEmail:
            case AssignedTemplate.ParticipatoryDisputePaymentWaitingForFeeWaiverProof:
            case AssignedTemplate.ParticipatoryDisputeWaitingForOfficePayment:
            case AssignedTemplate.ParticipatoryApplicantEvidenceReminder:
            case AssignedTemplate.ParticipatoryRespondentEvidenceReminder:
            case AssignedTemplate.EmergRespondentEvidenceReminder:
            case AssignedTemplate.DisputeWithdrawn:
            case AssignedTemplate.DisputeCancelled:
            case AssignedTemplate.ParticipatoryUpdateSubmitted:
            case AssignedTemplate.DirectRequestApplicationSubmitted:
            case AssignedTemplate.DirectRequestOfficePaymentRequired:
            case AssignedTemplate.DirectRequestUpdateSubmitted:
            case AssignedTemplate.PaymentSubmitted:
            case AssignedTemplate.DisputeAbandonedDueToApplicantInaction:
            case AssignedTemplate.DisputeAbandonedDueToApplicantServiceInaction:
            case AssignedTemplate.AccessCodeRecovery:
            case AssignedTemplate.AricParticipatoryApplicantEvidenceReminder:
            case AssignedTemplate.PfrParticipatoryApplicantEvidenceReminder:
            case AssignedTemplate.AricParticipatoryDisputeWaitingForOfficePayment:
            case AssignedTemplate.AricParticipatoryApplicationSubmitted:
            case AssignedTemplate.AricParticipatoryUpdateSubmitted:
            case AssignedTemplate.PfrParticipatoryDisputeWaitingForOfficePayment:
            case AssignedTemplate.PfrParticipatoryApplicationSubmitted:
            case AssignedTemplate.PfrParticipatoryUpdateSubmitted:
                subject = subject.Replace("<file_number>", dispute.FileNumber.ToString());
                return subject;
            case AssignedTemplate.ParticipatoryHearingReminder:
                var hearing = await _unitOfWork.HearingRepository.GetLastHearing(request.DisputeGuid);
                subject = subject.Replace("<file_number>", dispute.FileNumber.ToString());
                if (hearing?.LocalStartDateTime != null)
                {
                    subject = subject.Replace("<hearing_start_date>", hearing.LocalStartDateTime.Value.Date.ToString("MMMM dd yyyy"));
                    subject = subject.Replace("<hearing_start_time PST>", hearing.LocalStartDateTime.Value.ToString("hh:mm tt") + " PST");
                }

                return subject;
            default:
                throw new ArgumentOutOfRangeException();
        }
    }

    private void Publish(EmailNotificationIntegrationEvent message)
    {
        _bus.PubSub.PublishAsync(message)
            .ContinueWith(task =>
            {
                if (task.IsCompleted)
                {
                    Log.Information("Publish email generation event: {DisputeGuid} {MessageType}", message.DisputeGuid, message.MessageType);
                }
                if (task.IsFaulted)
                {
                    Log.Error(task.Exception, "Publish email generation event");
                }
            });
    }
}