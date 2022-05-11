using CM.Common.Utilities;
using CM.Data.Model;
using CM.Messages.EmailGenerator.Events;
using EasyNetQ;

////UseCase8
namespace CM.Business.Services.DisputeStatusHandler;

public class DisputeWithdrawn : DisputeTransition
{
    public DisputeWithdrawn(IBus messageBus)
        : base(
            DisputeStage.Any,
            DisputeStatuses.Any,
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.Withdrawn,
            DisputeProcess.Any,
            messageBus)
    {
    }

    protected override void Handle(Dispute dispute)
    {
        var message = new EmailGenerateIntegrationEvent
        {
            DisputeGuid = dispute.DisputeGuid,
            MessageType = EmailMessageType.SystemEmail,
            AssignedTemplateId = AssignedTemplate.DisputeWithdrawn
        };

        Publish(message);
    }
}

public class DisputeWithdrawn2 : DisputeTransition
{
    public DisputeWithdrawn2(IBus messageBus)
        : base(
            DisputeStage.Any,
            DisputeStatuses.Any,
            DisputeStage.ApplicationScreening,
            DisputeStatuses.Withdrawn,
            DisputeProcess.Any,
            messageBus)
    {
    }

    protected override void Handle(Dispute dispute)
    {
        var message = new EmailGenerateIntegrationEvent
        {
            DisputeGuid = dispute.DisputeGuid,
            MessageType = EmailMessageType.SystemEmail,
            AssignedTemplateId = AssignedTemplate.DisputeWithdrawn
        };

        Publish(message);
    }
}

public class DisputeWithdrawn3 : DisputeTransition
{
    public DisputeWithdrawn3(IBus messageBus)
        : base(
            DisputeStage.Any,
            DisputeStatuses.Any,
            DisputeStage.ServingDocuments,
            DisputeStatuses.Withdrawn,
            DisputeProcess.Any,
            messageBus)
    {
    }

    protected override void Handle(Dispute dispute)
    {
        var message = new EmailGenerateIntegrationEvent
        {
            DisputeGuid = dispute.DisputeGuid,
            MessageType = EmailMessageType.SystemEmail,
            AssignedTemplateId = AssignedTemplate.DisputeWithdrawn
        };

        Publish(message);
    }
}

public class DisputeWithdrawn4 : DisputeTransition
{
    public DisputeWithdrawn4(IBus messageBus)
        : base(
            DisputeStage.Any,
            DisputeStatuses.Any,
            DisputeStage.HearingPending,
            DisputeStatuses.Withdrawn,
            DisputeProcess.Any,
            messageBus)
    {
    }

    protected override void Handle(Dispute dispute)
    {
        var message = new EmailGenerateIntegrationEvent
        {
            DisputeGuid = dispute.DisputeGuid,
            MessageType = EmailMessageType.SystemEmail,
            AssignedTemplateId = AssignedTemplate.DisputeWithdrawn
        };

        Publish(message);
    }
}