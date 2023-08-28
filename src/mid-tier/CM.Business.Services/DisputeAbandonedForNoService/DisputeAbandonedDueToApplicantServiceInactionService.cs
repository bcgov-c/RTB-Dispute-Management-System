using System;
using System.Threading.Tasks;
using CM.Business.Services.Base;
using CM.Business.Services.SystemSettingsService;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.Messages.EmailGenerator.Events;
using CM.UserResolverService;
using EasyNetQ;

namespace CM.Business.Services.DisputeAbandonedForNoService;

public class DisputeAbandonedDueToApplicantServiceInactionService : CmServiceBase, IDisputeAbandonedDueToApplicantServiceInactionService
{
    private readonly IBus _bus;

    private readonly ISystemSettingsService _systemSettingsService;

    private readonly IUserResolver _userResolver;

    public DisputeAbandonedDueToApplicantServiceInactionService(IUnitOfWork unitOfWork, IBus bus, ISystemSettingsService systemSettingsService, IUserResolver userResolver)
        : base(unitOfWork)
    {
        _bus = bus;
        _userResolver = userResolver;
        _systemSettingsService = systemSettingsService;
    }

    public async Task<bool> ProcessDisputeAbandonedForNoService()
    {
        var disputeAbandonedNoServiceDays = await _systemSettingsService.GetValueAsync<int>(SettingKeys.DisputeAbandonedNoServiceDays);

        var abandonedDisputeStatuses = await UnitOfWork.DisputeStatusRepository.GetDisputeAbandonedForNoServiceStatuses(disputeAbandonedNoServiceDays);
        foreach (var abandonedDisputeStatus in abandonedDisputeStatuses)
        {
            var now = DateTime.UtcNow;

            var message = new EmailGenerateIntegrationEvent
            {
                DisputeGuid = abandonedDisputeStatus.DisputeGuid,
                MessageType = EmailMessageType.SystemEmail,
                AssignedTemplateId = AssignedTemplate.DisputeAbandonedDueToApplicantServiceInaction
            };

            var newDisputeStatus = new DisputeStatus
            {
                DisputeGuid = abandonedDisputeStatus.DisputeGuid,
                Stage = (byte)DisputeStage.ServingDocuments,
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
                message.Publish(_bus);
            }
        }

        return true;
    }
}