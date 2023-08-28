using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Services.Base;
using CM.Business.Services.SystemSettingsService;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;
using CM.Messages.EmailGenerator.Events;
using EasyNetQ;

namespace CM.Business.Services.ManualHearingVerification
{
    public class ManualHearingVerificationService : CmServiceBase, IManualHearingVerificationService
    {
        public ManualHearingVerificationService(IMapper mapper, IUnitOfWork unitOfWork, IBus bus, ISystemSettingsService systemSettingsService)
        : base(unitOfWork, mapper)
        {
            Bus = bus;
            SystemSettingsService = systemSettingsService;
        }

        private IBus Bus { get; }

        private ISystemSettingsService SystemSettingsService { get; }

        // CASE 1
        public async Task<bool> RunMhvAppCnFirstReminder()
        {
            var reminderPeriod = await SystemSettingsService.GetValueAsync<int>(SettingKeys.MhvAppCnFirstReminderPeriod);
            var sharedHearingLinkedTypes = new SharedHearingLinkType[] { SharedHearingLinkType.Single, SharedHearingLinkType.Cross, SharedHearingLinkType.Repeat, SharedHearingLinkType.RepeatCross };
            var creationMethods = new DisputeCreationMethod[] { DisputeCreationMethod.Online, DisputeCreationMethod.PaperRentIncrease };

            var disputes = await UnitOfWork
                .DisputeRepository
                .GetMhvAppCnDisputes(reminderPeriod, sharedHearingLinkedTypes, creationMethods, true);

            var participants = await UnitOfWork
                .ParticipantRepository
                .GetPrimaryApplicants(disputes);

            foreach (var participant in participants)
            {
                var message = new EmailGenerateIntegrationEvent
                {
                    DisputeGuid = participant.DisputeGuid,
                    ParticipantId = participant.ParticipantId,
                    MessageType = EmailMessageType.Notification,
                    AssignedTemplateId = AssignedTemplate.MhvApplicantAnyLinkedCnReminder
                };

                message.Publish(Bus);
            }

            return true;
        }

        // CASE 2
        public async Task<bool> RunMhvAppNotLinkedFirstReminder()
        {
            var reminderPeriod = await SystemSettingsService.GetValueAsync<int>(SettingKeys.MhvAppNotLinkedFirstReminderPeriod);
            var sharedHearingLinkedTypes = new SharedHearingLinkType[] { SharedHearingLinkType.Single, SharedHearingLinkType.Repeat };
            var creationMethods = new DisputeCreationMethod[] { DisputeCreationMethod.Online, DisputeCreationMethod.Manual, DisputeCreationMethod.OnlineRentIncrease, DisputeCreationMethod.PaperRentIncrease, DisputeCreationMethod.PossessionForRenovation };

            var disputes = await UnitOfWork
                .DisputeRepository
                .GetMhvAppCnDisputes(reminderPeriod, sharedHearingLinkedTypes, creationMethods, false);

            var participants = await UnitOfWork
                .ParticipantRepository
                .GetPrimaryApplicants(disputes);

            foreach (var participant in participants)
            {
                var message = new EmailGenerateIntegrationEvent
                {
                    DisputeGuid = participant.DisputeGuid,
                    ParticipantId = participant.ParticipantId,
                    MessageType = EmailMessageType.Notification,
                    AssignedTemplateId = AssignedTemplate.MhvApplicantNotLinkedNotCnReminder
                };

                message.Publish(Bus);
            }

            return true;
        }

        // CASE 3
        public async Task<bool> RunMhvAppLinkedFirstReminder()
        {
            var reminderPeriod = await SystemSettingsService.GetValueAsync<int>(SettingKeys.MhvAppLinkedFirstReminderPeriod);
            var sharedHearingLinkedTypes = new SharedHearingLinkType[] { SharedHearingLinkType.Cross, SharedHearingLinkType.RepeatCross };
            var creationMethods = new DisputeCreationMethod[]
            {
                DisputeCreationMethod.Online,
                DisputeCreationMethod.Manual
            };

            var disputes = await UnitOfWork
                .DisputeRepository
                .GetMhvAppCnDisputes(reminderPeriod, sharedHearingLinkedTypes, creationMethods, false);

            var participants = await UnitOfWork
                .ParticipantRepository
                .GetPrimaryApplicants(disputes);

            foreach (var participant in participants)
            {
                var message = new EmailGenerateIntegrationEvent
                {
                    DisputeGuid = participant.DisputeGuid,
                    ParticipantId = participant.ParticipantId,
                    MessageType = EmailMessageType.Notification,
                    AssignedTemplateId = AssignedTemplate.MhvApplicantLinkedNotCnReminder
                };

                message.Publish(Bus);
            }

            return true;
        }

        // CASE 4
        public async Task<bool> RunMhvAppCnFinalReminder()
        {
            var reminderPeriod = await SystemSettingsService.GetValueAsync<int>(SettingKeys.MhvAppCnFinalReminderPeriod);
            var sharedHearingLinkedTypes = new SharedHearingLinkType[] { SharedHearingLinkType.Single, SharedHearingLinkType.Cross, SharedHearingLinkType.Repeat, SharedHearingLinkType.RepeatCross };
            var creationMethods = new DisputeCreationMethod[] { DisputeCreationMethod.Online, DisputeCreationMethod.PaperRentIncrease };

            var disputes = await UnitOfWork
                .DisputeRepository
                .GetMhvAppCnDisputes(reminderPeriod, sharedHearingLinkedTypes, creationMethods, true);

            var participants = await UnitOfWork
                .ParticipantRepository
                .GetPrimaryApplicants(disputes);

            foreach (var participant in participants)
            {
                var message = new EmailGenerateIntegrationEvent
                {
                    DisputeGuid = participant.DisputeGuid,
                    ParticipantId = participant.ParticipantId,
                    MessageType = EmailMessageType.Notification,
                    AssignedTemplateId = AssignedTemplate.MhvFinalApplicantCnAnyLinkedReminder
                };

                message.Publish(Bus);
            }

            return true;
        }

        // CASE 5
        public async Task<bool> RunMhvAppNotLinkedFinalReminder()
        {
            var reminderPeriod = await SystemSettingsService.GetValueAsync<int>(SettingKeys.MhvAppNotLinkedFinalReminderPeriod);
            var sharedHearingLinkedTypes = new SharedHearingLinkType[] { SharedHearingLinkType.Single, SharedHearingLinkType.Repeat };
            var creationMethods = new DisputeCreationMethod[] { DisputeCreationMethod.Online, DisputeCreationMethod.Manual, DisputeCreationMethod.OnlineRentIncrease, DisputeCreationMethod.PaperRentIncrease, DisputeCreationMethod.PossessionForRenovation };

            var disputes = await UnitOfWork
                .DisputeRepository
                .GetMhvAppCnDisputes(reminderPeriod, sharedHearingLinkedTypes, creationMethods, false);

            var participants = await UnitOfWork
                .ParticipantRepository
                .GetPrimaryApplicants(disputes);

            foreach (var participant in participants)
            {
                var message = new EmailGenerateIntegrationEvent
                {
                    DisputeGuid = participant.DisputeGuid,
                    ParticipantId = participant.ParticipantId,
                    MessageType = EmailMessageType.Notification,
                    AssignedTemplateId = AssignedTemplate.MhvFinalApplicantNotCnNotLinkedReminder
                };

                message.Publish(Bus);
            }

            return true;
        }

        // CASE 6
        public async Task<bool> RunMhvAppLinkedFinalReminder()
        {
            var reminderPeriod = await SystemSettingsService.GetValueAsync<int>(SettingKeys.MhvAppLinkedFinalReminderPeriod);
            var sharedHearingLinkedTypes = new SharedHearingLinkType[] { SharedHearingLinkType.Cross, SharedHearingLinkType.RepeatCross };
            var creationMethods = new DisputeCreationMethod[]
            {
                DisputeCreationMethod.Online,
                DisputeCreationMethod.Manual
            };

            var disputes = await UnitOfWork
                .DisputeRepository
                .GetMhvAppCnDisputes(reminderPeriod, sharedHearingLinkedTypes, creationMethods, false);

            var participants = await UnitOfWork
                .ParticipantRepository
                .GetPrimaryApplicants(disputes);

            foreach (var participant in participants)
            {
                var message = new EmailGenerateIntegrationEvent
                {
                    DisputeGuid = participant.DisputeGuid,
                    ParticipantId = participant.ParticipantId,
                    MessageType = EmailMessageType.Notification,
                    AssignedTemplateId = AssignedTemplate.MhvFinalApplicantLinkedNotCnReminder
                };

                message.Publish(Bus);
            }

            return true;
        }
    }
}
