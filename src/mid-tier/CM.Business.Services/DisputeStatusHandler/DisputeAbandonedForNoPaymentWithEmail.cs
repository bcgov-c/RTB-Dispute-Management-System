using CM.Business.Services.Base;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Messages.EmailGenerator.Events;
using EasyNetQ;

////UseCase3
namespace CM.Business.Services.DisputeStatusHandler;

public class DisputeAbandonedForNoPaymentWithEmail : DisputeTransition
{
    public DisputeAbandonedForNoPaymentWithEmail(IBus messageBus)
        : base(
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.PaymentRequired,
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.AbandonedNoPayment,
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
            AssignedTemplateId = AssignedTemplate.DisputeAbandonedForNoPaymentWithEmail
        };

        message.Publish(Bus);
    }
}

public class DisputeAbandonedForNoPaymentWithEmail2 : DisputeTransition
{
    public DisputeAbandonedForNoPaymentWithEmail2(IBus messageBus)
        : base(
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.FeeWaiverProofRequired,
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.AbandonedNoPayment,
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
            AssignedTemplateId = AssignedTemplate.DisputeAbandonedForNoPaymentWithEmail
        };

        message.Publish(Bus);
    }
}

public class DisputeAbandonedForNoPaymentWithEmail3 : DisputeTransition
{
    public DisputeAbandonedForNoPaymentWithEmail3(IBus messageBus)
        : base(
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.OfficePaymentRequired,
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.AbandonedNoPayment,
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
            AssignedTemplateId = AssignedTemplate.DisputeAbandonedForNoPaymentWithEmail
        };

        message.Publish(Bus);
    }
}