using CM.Common.Utilities;
using CM.Data.Model;
using CM.Messages.EmailGenerator.Events;
using EasyNetQ;

////UseCase18
namespace CM.Business.Services.DisputeStatusHandler;

public class AricParticipatoryApplicationSubmitted : DisputeTransition
{
    public AricParticipatoryApplicationSubmitted(IBus messageBus)
        : base(
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.SavedNotSubmitted,
            DisputeStage.ApplicationScreening,
            DisputeStatuses.Received,
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
                AssignedTemplateId = AssignedTemplate.AricParticipatoryApplicationSubmitted
            };

            Publish(message);
        }
    }
}

public class AricParticipatoryApplicationSubmitted2 : DisputeTransition
{
    public AricParticipatoryApplicationSubmitted2(IBus messageBus)
        : base(
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.PaymentRequired,
            DisputeStage.ApplicationScreening,
            DisputeStatuses.Received,
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
                AssignedTemplateId = AssignedTemplate.AricParticipatoryApplicationSubmitted
            };

            Publish(message);
        }
    }
}

public class AricParticipatoryApplicationSubmitted3 : DisputeTransition
{
    public AricParticipatoryApplicationSubmitted3(IBus messageBus)
        : base(
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.FeeWaiverProofRequired,
            DisputeStage.ApplicationScreening,
            DisputeStatuses.Received,
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
                AssignedTemplateId = AssignedTemplate.AricParticipatoryApplicationSubmitted
            };

            Publish(message);
        }
    }
}

public class AricParticipatoryApplicationSubmitted4 : DisputeTransition
{
    public AricParticipatoryApplicationSubmitted4(IBus messageBus)
        : base(
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.OfficePaymentRequired,
            DisputeStage.ApplicationScreening,
            DisputeStatuses.Received,
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
                AssignedTemplateId = AssignedTemplate.AricParticipatoryApplicationSubmitted
            };

            Publish(message);
        }
    }
}