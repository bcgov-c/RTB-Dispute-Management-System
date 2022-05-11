using System;
using System.Linq;
using System.Threading.Tasks;
using CM.Business.Services.SystemSettingsService;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;
using CM.Messages.EmailGenerator.Events;
using EasyNetQ;
using Serilog;

namespace CM.Business.Services.PfrApplicantEvidenceReminder;

public class PfrParticipatoryApplicantEvidenceReminderService : CmServiceBase, IPfrParticipatoryApplicantEvidenceReminderService
{
    private readonly IBus _bus;

    private readonly ISystemSettingsService _systemSettingsService;

    public PfrParticipatoryApplicantEvidenceReminderService(IUnitOfWork unitOfWork, IBus bus, ISystemSettingsService systemSettingsService)
        : base(unitOfWork)
    {
        _bus = bus;
        _systemSettingsService = systemSettingsService;
    }

    public async Task<bool> Handle()
    {
        var pfrParticipatoryApplicantEvidenceReminderDays = await _systemSettingsService.GetValueAsync<int>(SettingKeys.PfrParticipatoryApplicantEvidenceReminderPeriod);
        var addDays = DateTime.UtcNow.AddDays(pfrParticipatoryApplicantEvidenceReminderDays).Date;
        var pfrApplicantEvidenceReminders = await UnitOfWork.HearingRepository.GetHearingByDateAndCreationMethod(addDays, DisputeCreationMethod.PossessionForRenovation);

        foreach (var firstDisputeHearing in pfrApplicantEvidenceReminders.Select(hearing => hearing.DisputeHearings.FirstOrDefault()))
        {
            if (firstDisputeHearing?.DisputeGuid == null)
            {
                continue;
            }

            var closedForSubmission = await UnitOfWork.DisputeStatusRepository.IsClosedForSubmission(firstDisputeHearing.DisputeGuid.Value);
            if (closedForSubmission)
            {
                continue;
            }

            var message = new EmailGenerateIntegrationEvent
            {
                DisputeGuid = firstDisputeHearing.DisputeGuid.Value,
                MessageType = EmailMessageType.Notification,
                AssignedTemplateId = AssignedTemplate.PfrParticipatoryApplicantEvidenceReminder
            };

            Publish(message);
        }

        return true;
    }

    private void Publish(EmailGenerateIntegrationEvent message)
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
                    Log.Error(task.Exception, "CorrelationGuid = {CorrelationGuid}", message.CorrelationGuid);
                    throw new Exception($"CorrelationGuid = {message.CorrelationGuid} exception", task.Exception);
                }
            });
    }
}