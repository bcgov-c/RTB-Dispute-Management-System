using CM.Common.Utilities;
using CM.Data.Model;
using CM.Messages.EmailGenerator.Events;
using EasyNetQ;

////UseCase4
namespace CM.Business.Services.DisputeStatusHandler;

public class ParticipatoryDisputePaymentWaitingForFeeWaiverProof : DisputeTransition
{
    public ParticipatoryDisputePaymentWaitingForFeeWaiverProof(IBus messageBus)
        : base(
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.SavedNotSubmitted,
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.FeeWaiverProofRequired,
            DisputeProcess.ParticipatoryHearing,
            messageBus)
    {
    }

    protected override void Handle(Dispute dispute)
    {
        var creationMethod = (DisputeCreationMethod)dispute.CreationMethod.GetValueOrDefault();
        if (creationMethod is DisputeCreationMethod.OnlineRentIncrease or DisputeCreationMethod.PossessionForRenovation)
        {
            return;
        }

        var message = new EmailGenerateIntegrationEvent
        {
            DisputeGuid = dispute.DisputeGuid,
            MessageType = EmailMessageType.SystemEmail,
            AssignedTemplateId = AssignedTemplate.ParticipatoryDisputePaymentWaitingForFeeWaiverProof
        };

        Publish(message);
    }
}

public class ParticipatoryDisputePaymentWaitingForFeeWaiverProof2 : DisputeTransition
{
    public ParticipatoryDisputePaymentWaitingForFeeWaiverProof2(IBus messageBus)
        : base(
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.PaymentRequired,
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.FeeWaiverProofRequired,
            DisputeProcess.ParticipatoryHearing,
            messageBus)
    {
    }

    protected override void Handle(Dispute dispute)
    {
        var creationMethod = (DisputeCreationMethod)dispute.CreationMethod.GetValueOrDefault();
        if (creationMethod is DisputeCreationMethod.OnlineRentIncrease or DisputeCreationMethod.PossessionForRenovation)
        {
            return;
        }

        var message = new EmailGenerateIntegrationEvent
        {
            DisputeGuid = dispute.DisputeGuid,
            MessageType = EmailMessageType.SystemEmail,
            AssignedTemplateId = AssignedTemplate.ParticipatoryDisputePaymentWaitingForFeeWaiverProof
        };

        Publish(message);
    }
}

public class ParticipatoryDisputePaymentWaitingForFeeWaiverProof3 : DisputeTransition
{
    public ParticipatoryDisputePaymentWaitingForFeeWaiverProof3(IBus messageBus)
        : base(
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.OfficePaymentRequired,
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.FeeWaiverProofRequired,
            DisputeProcess.ParticipatoryHearing,
            messageBus)
    {
    }

    protected override void Handle(Dispute dispute)
    {
        var creationMethod = (DisputeCreationMethod)dispute.CreationMethod.GetValueOrDefault();
        if (creationMethod is DisputeCreationMethod.OnlineRentIncrease or DisputeCreationMethod.PossessionForRenovation)
        {
            return;
        }

        var message = new EmailGenerateIntegrationEvent
        {
            DisputeGuid = dispute.DisputeGuid,
            MessageType = EmailMessageType.SystemEmail,
            AssignedTemplateId = AssignedTemplate.ParticipatoryDisputePaymentWaitingForFeeWaiverProof
        };

        Publish(message);
    }
}