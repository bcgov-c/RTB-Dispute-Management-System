using CM.Common.Utilities;
using CM.Data.Model;
using CM.Messages.EmailGenerator.Events;
using EasyNetQ;

////UseCase20
namespace CM.Business.Services.DisputeStatusHandler;

public class AricParticipatoryDisputeWaitingForOfficePayment : DisputeTransition
{
    public AricParticipatoryDisputeWaitingForOfficePayment(IBus messageBus)
        : base(
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.SavedNotSubmitted,
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.OfficePaymentRequired,
            DisputeProcess.RentIncrease,
            messageBus)
    {
    }

    protected override void Handle(Dispute dispute)
    {
        var creationMethod = (DisputeCreationMethod)dispute.CreationMethod.GetValueOrDefault();

        if (creationMethod == DisputeCreationMethod.OnlineRentIncrease)
        {
            var message = new EmailGenerateIntegrationEvent
            {
                DisputeGuid = dispute.DisputeGuid,
                MessageType = EmailMessageType.SystemEmail,
                AssignedTemplateId = AssignedTemplate.AricParticipatoryDisputeWaitingForOfficePayment
            };

            Publish(message);
        }
    }
}

public class AricParticipatoryDisputeWaitingForOfficePayment2 : DisputeTransition
{
    public AricParticipatoryDisputeWaitingForOfficePayment2(IBus messageBus)
        : base(
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.PaymentRequired,
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.OfficePaymentRequired,
            DisputeProcess.RentIncrease,
            messageBus)
    {
    }

    protected override void Handle(Dispute dispute)
    {
        var creationMethod = (DisputeCreationMethod)dispute.CreationMethod.GetValueOrDefault();

        if (creationMethod == DisputeCreationMethod.OnlineRentIncrease)
        {
            var message = new EmailGenerateIntegrationEvent
            {
                DisputeGuid = dispute.DisputeGuid,
                MessageType = EmailMessageType.SystemEmail,
                AssignedTemplateId = AssignedTemplate.AricParticipatoryDisputeWaitingForOfficePayment
            };

            Publish(message);
        }
    }
}

public class AricParticipatoryDisputeWaitingForOfficePayment3 : DisputeTransition
{
    public AricParticipatoryDisputeWaitingForOfficePayment3(IBus messageBus)
        : base(
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.FeeWaiverProofRequired,
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.OfficePaymentRequired,
            DisputeProcess.RentIncrease,
            messageBus)
    {
    }

    protected override void Handle(Dispute dispute)
    {
        var creationMethod = (DisputeCreationMethod)dispute.CreationMethod.GetValueOrDefault();

        if (creationMethod == DisputeCreationMethod.OnlineRentIncrease)
        {
            var message = new EmailGenerateIntegrationEvent
            {
                DisputeGuid = dispute.DisputeGuid,
                MessageType = EmailMessageType.SystemEmail,
                AssignedTemplateId = AssignedTemplate.AricParticipatoryDisputeWaitingForOfficePayment
            };

            Publish(message);
        }
    }
}