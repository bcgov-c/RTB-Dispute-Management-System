using System;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Services.Base;
using CM.Business.Services.SystemSettingsService;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;
using CM.Messages.EmailGenerator.Events;
using EasyNetQ;

namespace CM.Business.Services.ScheduledHearingReminder;

public class ScheduledReminderService : CmServiceBase, IScheduledReminderService
{
    public ScheduledReminderService(IMapper mapper, IUnitOfWork unitOfWork, IBus bus, ISystemSettingsService systemSettingsService)
        : base(unitOfWork, mapper)
    {
        Bus = bus;
        SystemSettingsService = systemSettingsService;
    }

    private IBus Bus { get; }

    private ISystemSettingsService SystemSettingsService { get; }

    public async Task<bool> ParticipatoryApplicantEvidenceReminderNotifications()
    {
        var participatoryApplicantEvidenceReminderPeriod = await SystemSettingsService.GetValueAsync<int>(SettingKeys.ParticipatoryApplicantEvidenceReminderPeriod);
        var addDays = DateTime.UtcNow.AddDays(participatoryApplicantEvidenceReminderPeriod).Date;
        var applicantEvidenceReminders = await UnitOfWork.HearingRepository.GetHearingByDate(addDays);

        foreach (var firstDisputeHearing in applicantEvidenceReminders.Select(hearing => hearing.DisputeHearings.FirstOrDefault()))
        {
            if (firstDisputeHearing?.DisputeGuid != null && firstDisputeHearing.Dispute.DisputeUrgency != (byte)DisputeUrgency.Emergency)
            {
                var closedForSubmission = await UnitOfWork.DisputeStatusRepository.IsClosedForSubmission(firstDisputeHearing.DisputeGuid.Value);
                if (closedForSubmission)
                {
                    continue;
                }

                var message = new EmailGenerateIntegrationEvent
                {
                    DisputeGuid = firstDisputeHearing.DisputeGuid.Value,
                    MessageType = EmailMessageType.Notification,
                    AssignedTemplateId = AssignedTemplate.ParticipatoryApplicantEvidenceReminder
                };

                message.Publish(Bus);
            }
        }

        return true;
    }

    public async Task<bool> RunParticipatoryHearingReminderNotifications()
    {
        var participatoryHearingReminderPeriod = await SystemSettingsService.GetValueAsync<int>(SettingKeys.ParticipatoryHearingReminderPeriod);

        var addDays = DateTime.UtcNow.AddDays(participatoryHearingReminderPeriod).Date;

        var respondentEvidenceReminders = await UnitOfWork.HearingRepository.GetHearingByDate(addDays);

        foreach (var firstDisputeHearing in respondentEvidenceReminders.Select(hearing => hearing.DisputeHearings.FirstOrDefault()))
        {
            if (firstDisputeHearing?.DisputeGuid != null)
            {
                var message = new EmailGenerateIntegrationEvent
                {
                    DisputeGuid = firstDisputeHearing.DisputeGuid.Value,
                    MessageType = EmailMessageType.Notification,
                    AssignedTemplateId = AssignedTemplate.ParticipatoryHearingReminder
                };

                message.Publish(Bus);
            }
        }

        return true;
    }

    public async Task<bool> ParticipatoryRespondentEvidenceReminderNotifications()
    {
        var participatoryRespondentEvidenceReminderPeriod = await SystemSettingsService.GetValueAsync<int>(SettingKeys.ParticipatoryRespondentEvidenceReminderPeriod);

        var addDays = DateTime.UtcNow.AddDays(participatoryRespondentEvidenceReminderPeriod).Date;

        var hearingReminders = await UnitOfWork.HearingRepository.GetHearingByDate(addDays);

        foreach (var firstDisputeHearing in hearingReminders.Select(hearing => hearing.DisputeHearings.FirstOrDefault()))
        {
            if (firstDisputeHearing?.DisputeGuid != null && firstDisputeHearing?.Dispute.DisputeUrgency != (byte)DisputeUrgency.Emergency)
            {
                var closedForSubmission = await UnitOfWork.DisputeStatusRepository.IsClosedForSubmission(firstDisputeHearing.DisputeGuid.Value);
                if (closedForSubmission)
                {
                    continue;
                }

                var message = new EmailGenerateIntegrationEvent
                {
                    DisputeGuid = firstDisputeHearing.DisputeGuid.Value,
                    MessageType = EmailMessageType.Notification,
                    AssignedTemplateId = AssignedTemplate.ParticipatoryRespondentEvidenceReminder
                };

                message.Publish(Bus);
            }
        }

        return true;
    }

    public async Task<bool> ParticipatoryEmergRespondentEvidenceReminderPeriodNotifications()
    {
        var participatoryEmergRespondentEvidenceReminderPeriod = await SystemSettingsService.GetValueAsync<int>(SettingKeys.ParticipatoryEmergRespondentEvidenceReminderPeriod);

        var addDays = DateTime.UtcNow.AddDays(participatoryEmergRespondentEvidenceReminderPeriod).Date;

        var hearingReminders = await UnitOfWork.HearingRepository.GetHearingByDate(addDays);

        foreach (var firstDisputeHearing in hearingReminders.Select(hearing => hearing.DisputeHearings.FirstOrDefault()))
        {
            if (firstDisputeHearing?.DisputeGuid != null && firstDisputeHearing.Dispute.DisputeUrgency == (byte)DisputeUrgency.Emergency)
            {
                var closedForSubmission = await UnitOfWork.DisputeStatusRepository.IsClosedForSubmission(firstDisputeHearing.DisputeGuid.Value);
                if (closedForSubmission)
                {
                    continue;
                }

                var message = new EmailGenerateIntegrationEvent
                {
                    DisputeGuid = firstDisputeHearing.DisputeGuid.Value,
                    MessageType = EmailMessageType.Notification,
                    AssignedTemplateId = AssignedTemplate.EmergRespondentEvidenceReminder
                };

                message.Publish(Bus);
            }
        }

        return true;
    }
}