using System;
using System.Threading.Tasks;
using CM.Business.Services.SystemSettingsService;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.Messages.EmailGenerator.Events;
using CM.UserResolverService;
using EasyNetQ;
using Serilog;

namespace CM.Business.Services.AbandonedDisputesNotification;

public class DisputeAbandonedDueToApplicantInactionService : CmServiceBase, IDisputeAbandonedDueToApplicantInactionService
{
    private readonly IBus _bus;

    private readonly ISystemSettingsService _systemSettingsService;

    private readonly IUserResolver _userResolver;

    public DisputeAbandonedDueToApplicantInactionService(IUnitOfWork unitOfWork, IBus bus, ISystemSettingsService systemSettingsService, IUserResolver userResolver)
        : base(unitOfWork)
    {
        _bus = bus;
        _userResolver = userResolver;
        _systemSettingsService = systemSettingsService;
    }

    public async Task<bool> ProcessNotifications()
    {
        var disputeAbandonedDays = await _systemSettingsService.GetValueAsync<int>(SettingKeys.DisputeAbandonedDays);
        var abandonedDisputeStatuses = await UnitOfWork.DisputeStatusRepository.GetAbandonedDisputeStatuses(disputeAbandonedDays);
        foreach (var abandonedDisputeStatus in abandonedDisputeStatuses)
        {
            var now = DateTime.UtcNow;

            var message = new EmailGenerateIntegrationEvent
            {
                DisputeGuid = abandonedDisputeStatus.DisputeGuid,
                MessageType = EmailMessageType.SystemEmail,
                AssignedTemplateId = AssignedTemplate.DisputeAbandonedDueToApplicantInaction
            };

            var newDisputeStatus = new DisputeStatus
            {
                DisputeGuid = abandonedDisputeStatus.DisputeGuid,
                Stage = (byte)DisputeStage.ApplicationInProgress,
                Status = (byte)DisputeStatuses.AbandonedApplicantInaction,
                Process = abandonedDisputeStatus.Process,
                Owner = abandonedDisputeStatus.Owner,
                EvidenceOverride = abandonedDisputeStatus.EvidenceOverride,
                StatusStartDate = now,
                StatusSetBy = _userResolver.GetUserId(),
                IsActive = true
            };

            var duration = now - abandonedDisputeStatus.StatusStartDate;
            abandonedDisputeStatus.DurationSeconds = (int)duration.TotalSeconds;
            abandonedDisputeStatus.IsActive = false;

            UnitOfWork.DisputeStatusRepository.Attach(abandonedDisputeStatus);
            await UnitOfWork.DisputeStatusRepository.InsertAsync(newDisputeStatus);
            var result = await UnitOfWork.Complete();

            if (result.CheckSuccess())
            {
                Publish(message);
            }
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
                    Log.Information("Publish email generation event: {CorrelationGuid} {DisputeGuid} {AssignedTemplateId}", message.CorrelationGuid, message.DisputeGuid, message.AssignedTemplateId);
                }
                if (task.IsFaulted)
                {
                    Log.Error(task.Exception, "CorrelationGuid = {CorrelationGuid}", message.CorrelationGuid);
                    throw new Exception($"CorrelationGuid = {message.CorrelationGuid} exception", task.Exception);
                }
            });
    }
}