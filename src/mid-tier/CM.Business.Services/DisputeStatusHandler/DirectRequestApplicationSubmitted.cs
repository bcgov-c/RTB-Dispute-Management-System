using CM.Business.Services.Base;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Messages.EmailGenerator.Events;
using EasyNetQ;

////UseCase11
namespace CM.Business.Services.DisputeStatusHandler;

public class DirectRequestApplicationSubmitted : DisputeTransition
{
    public DirectRequestApplicationSubmitted(IBus messageBus)
        : base(
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.SavedNotSubmitted,
            DisputeStage.ApplicationScreening,
            DisputeStatuses.Received,
            DisputeProcess.NonParticipatoryHearing,
            messageBus)
    {
    }

    protected override void Handle(Dispute dispute)
    {
        var message = new EmailGenerateIntegrationEvent
        {
            DisputeGuid = dispute.DisputeGuid,
            MessageType = EmailMessageType.SystemEmail,
            AssignedTemplateId = AssignedTemplate.DirectRequestApplicationSubmitted
        };

        message.Publish(Bus);
    }
}

public class DirectRequestApplicationSubmitted2 : DisputeTransition
{
    public DirectRequestApplicationSubmitted2(IBus messageBus)
        : base(
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.PaymentRequired,
            DisputeStage.ApplicationScreening,
            DisputeStatuses.Received,
            DisputeProcess.NonParticipatoryHearing,
            messageBus)
    {
    }

    protected override void Handle(Dispute dispute)
    {
        var message = new EmailGenerateIntegrationEvent
        {
            DisputeGuid = dispute.DisputeGuid,
            MessageType = EmailMessageType.SystemEmail,
            AssignedTemplateId = AssignedTemplate.DirectRequestApplicationSubmitted
        };

        message.Publish(Bus);
    }
}

public class DirectRequestApplicationSubmitted3 : DisputeTransition
{
    public DirectRequestApplicationSubmitted3(IBus messageBus)
        : base(
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.FeeWaiverProofRequired,
            DisputeStage.ApplicationScreening,
            DisputeStatuses.Received,
            DisputeProcess.NonParticipatoryHearing,
            messageBus)
    {
    }

    protected override void Handle(Dispute dispute)
    {
        var message = new EmailGenerateIntegrationEvent
        {
            DisputeGuid = dispute.DisputeGuid,
            MessageType = EmailMessageType.SystemEmail,
            AssignedTemplateId = AssignedTemplate.DirectRequestApplicationSubmitted
        };

        message.Publish(Bus);
    }
}

public class DirectRequestApplicationSubmitted4 : DisputeTransition
{
    public DirectRequestApplicationSubmitted4(IBus messageBus)
        : base(
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.OfficePaymentRequired,
            DisputeStage.ApplicationScreening,
            DisputeStatuses.Received,
            DisputeProcess.NonParticipatoryHearing,
            messageBus)
    {
    }

    protected override void Handle(Dispute dispute)
    {
        var message = new EmailGenerateIntegrationEvent
        {
            DisputeGuid = dispute.DisputeGuid,
            MessageType = EmailMessageType.SystemEmail,
            AssignedTemplateId = AssignedTemplate.DirectRequestApplicationSubmitted
        };

        message.Publish(Bus);
    }
}