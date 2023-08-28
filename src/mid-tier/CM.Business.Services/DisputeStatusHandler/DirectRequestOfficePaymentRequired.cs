using CM.Business.Services.Base;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Messages.EmailGenerator.Events;
using EasyNetQ;

////UseCase12
namespace CM.Business.Services.DisputeStatusHandler;

public class DirectRequestOfficePaymentRequired : DisputeTransition
{
    public DirectRequestOfficePaymentRequired(IBus messageBus)
        : base(
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.SavedNotSubmitted,
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.OfficePaymentRequired,
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
            AssignedTemplateId = AssignedTemplate.DirectRequestOfficePaymentRequired
        };

        message.Publish(Bus);
    }
}

public class DirectRequestOfficePaymentRequired2 : DisputeTransition
{
    public DirectRequestOfficePaymentRequired2(IBus messageBus)
        : base(
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.PaymentRequired,
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.OfficePaymentRequired,
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
            AssignedTemplateId = AssignedTemplate.DirectRequestOfficePaymentRequired
        };

        message.Publish(Bus);
    }
}

public class DirectRequestOfficePaymentRequired3 : DisputeTransition
{
    public DirectRequestOfficePaymentRequired3(IBus messageBus)
        : base(
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.FeeWaiverProofRequired,
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.OfficePaymentRequired,
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
            AssignedTemplateId = AssignedTemplate.DirectRequestOfficePaymentRequired
        };

        message.Publish(Bus);
    }
}