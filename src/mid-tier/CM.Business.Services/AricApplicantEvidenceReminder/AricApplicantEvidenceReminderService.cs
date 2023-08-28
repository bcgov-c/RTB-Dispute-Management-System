using System;
using System.Linq;
using System.Threading.Tasks;
using CM.Business.Services.Base;
using CM.Business.Services.SystemSettingsService;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;
using CM.Messages.EmailGenerator.Events;
using EasyNetQ;

namespace CM.Business.Services.AricApplicantEvidenceReminder;

public class AricApplicantEvidenceReminderService : CmServiceBase, IAricApplicantEvidenceReminderService
{
    private readonly IBus _bus;

    private readonly ISystemSettingsService _systemSettingsService;

    public AricApplicantEvidenceReminderService(IUnitOfWork unitOfWork, IBus bus, ISystemSettingsService systemSettingsService)
        : base(unitOfWork)
    {
        _bus = bus;
        _systemSettingsService = systemSettingsService;
    }

    public async Task<bool> Handle()
    {
        var aricParticipatoryApplicantEvidenceReminderDays = await _systemSettingsService.GetValueAsync<int>(SettingKeys.AricParticipatoryApplicantEvidenceReminderPeriod);
        var addDays = DateTime.UtcNow.AddDays(aricParticipatoryApplicantEvidenceReminderDays).Date;
        var aricApplicantEvidenceReminders = await UnitOfWork.HearingRepository.GetHearingByDateAndCreationMethod(addDays, DisputeCreationMethod.OnlineRentIncrease);

        foreach (var firstDisputeHearing in aricApplicantEvidenceReminders.Select(hearing => hearing.DisputeHearings.FirstOrDefault()))
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
                AssignedTemplateId = AssignedTemplate.AricParticipatoryApplicantEvidenceReminder
            };

            message.Publish(_bus);
        }

        return true;
    }
}