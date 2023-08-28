using System;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Services.Base;
using CM.Business.Services.SystemSettingsService;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.Messages.EmailGenerator.Events;
using EasyNetQ;
using Microsoft.Extensions.Options;

namespace CM.Business.Services.ArsReminder
{
    public class ArsReminderService : CmServiceBase, IArsReminderService
    {
        private readonly ISystemSettingsService _systemSettingsService;

        public ArsReminderService(IMapper mapper, IUnitOfWork unitOfWork, IBus bus, ISystemSettingsService systemSettingsService)
        : base(unitOfWork, mapper)
        {
            Bus = bus;
            _systemSettingsService = systemSettingsService;
        }

        private IBus Bus { get; }

        public async Task<bool> ArsDeclarationDeadlineReminderNotifications()
        {
            var dateDelay = await _systemSettingsService.GetValueAsync<int>(SettingKeys.ARSDeclarationReminderPeriod);
            var disputeGuids = await UnitOfWork.DisputeRepository.GetArsDeclarationDeadlineReminderDisputeGuids(dateDelay);

            foreach (var disputeGuid in disputeGuids)
            {
                var message = new EmailGenerateIntegrationEvent
                {
                    DisputeGuid = disputeGuid,
                    MessageType = EmailMessageType.Notification,
                    AssignedTemplateId = AssignedTemplate.ArsDeclarationDeadlineReminder
                };

                message.Publish(Bus);
            }

            return true;
        }

        public async Task<bool> ArsDeclarationDeadlineMissedNotifications()
        {
            var disputeGuids = await UnitOfWork.DisputeRepository.GetArsDeclarationDeadlineMissedDisputeGuids();

            foreach (var disputeGuid in disputeGuids)
            {
                var now = DateTime.UtcNow;
                var lastDisputeStatus = await UnitOfWork.DisputeStatusRepository.GetDisputeLastStatusAsync(disputeGuid);
                await UnitOfWork.DisputeStatusRepository.InsertAsync(new DisputeStatus()
                {
                    DisputeGuid = disputeGuid,
                    Stage = (byte?)DisputeStage.ServingDocuments,
                    Status = (byte)DisputeStatuses.Dismissed,
                    Process = (byte?)DisputeProcess.ParticipatoryHearing,
                    StatusSetBy = Constants.UndefinedUserId,
                    StatusStartDate = now,
                    IsActive = true
                });

                var duration = now - lastDisputeStatus.StatusStartDate;
                lastDisputeStatus.DurationSeconds = (int)duration.TotalSeconds;
                lastDisputeStatus.IsActive = false;
                UnitOfWork.DisputeStatusRepository.Attach(lastDisputeStatus);

                var message = new EmailGenerateIntegrationEvent
                {
                    DisputeGuid = disputeGuid,
                    MessageType = EmailMessageType.Notification,
                    AssignedTemplateId = AssignedTemplate.ArsDeclarationDeadlineMissed
                };

                message.Publish(Bus);
            }

            if (disputeGuids.Count > 0)
            {
                await UnitOfWork.Complete();
            }

            return true;
        }

        public async Task<bool> ArsReinstatementDeadlineReminderNotifications()
        {
            var dateDelay = await _systemSettingsService.GetValueAsync<int>(SettingKeys.ARSReinstatementReminderPeriod);
            var disputeGuids = await UnitOfWork.DisputeRepository.GetArsReinstatementDeadlineReminderDisputeGuids(dateDelay);

            foreach (var disputeGuid in disputeGuids)
            {
                var message = new EmailGenerateIntegrationEvent
                {
                    DisputeGuid = disputeGuid,
                    MessageType = EmailMessageType.Notification,
                    AssignedTemplateId = AssignedTemplate.ArsReinstatementDeadlineReminder
                };

                message.Publish(Bus);
            }

            return true;
        }

        public async Task<bool> ArsReinstatementDeadlineMissedNotifications()
        {
            var disputeGuids = await UnitOfWork.DisputeRepository.GetArsReinstatementDeadlineMissedDisputeGuids();

            foreach (var disputeGuid in disputeGuids)
            {
                await DeleteFutureDisputeHearings(disputeGuid);
                await InsertDisputeStatus(disputeGuid);

                var message = new EmailGenerateIntegrationEvent
                {
                    DisputeGuid = disputeGuid,
                    MessageType = EmailMessageType.Notification,
                    AssignedTemplateId = AssignedTemplate.ArsReinstatementDeadlineMissed
                };

                message.Publish(Bus);
            }

            if (disputeGuids.Count > 0)
            {
                await UnitOfWork.Complete();
            }

            return true;
        }

#region Private

        private async System.Threading.Tasks.Task DeleteFutureDisputeHearings(Guid disputeGuid)
        {
            var featureDisputeHearings = await UnitOfWork.DisputeHearingRepository.GetFutureDisputeHearings(disputeGuid);

            foreach (var featureDisputeHearing in featureDisputeHearings)
            {
                featureDisputeHearing.IsDeleted = true;
                UnitOfWork.DisputeHearingRepository.Attach(featureDisputeHearing);
            }
        }

        private async System.Threading.Tasks.Task InsertDisputeStatus(Guid disputeGuid)
        {
            var disputeStatus = new DisputeStatus();
            var now = DateTime.UtcNow;
            var lastDisputeStatus = await UnitOfWork.DisputeStatusRepository.GetDisputeLastStatusAsync(disputeGuid);

            disputeStatus.Stage = (byte?)DisputeStage.ServingDocuments;
            disputeStatus.Status = (byte)DisputeStatuses.Withdrawn;
            disputeStatus.Process = (byte?)DisputeProcess.ParticipatoryHearing;
            disputeStatus.DisputeGuid = disputeGuid;
            disputeStatus.StatusStartDate = now;
            disputeStatus.IsActive = true;
            disputeStatus.StatusSetBy = Constants.UndefinedUserId;

            await UnitOfWork.DisputeStatusRepository.InsertAsync(disputeStatus);

            var duration = now - lastDisputeStatus.StatusStartDate;
            lastDisputeStatus.DurationSeconds = (int)duration.TotalSeconds;
            lastDisputeStatus.IsActive = false;
            UnitOfWork.DisputeStatusRepository.Attach(lastDisputeStatus);
        }

#endregion

    }
}
