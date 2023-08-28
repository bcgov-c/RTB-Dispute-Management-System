using CM.Business.Services.Base;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Messages.EmailGenerator.Events;
using EasyNetQ;

////UseCase5
////UseCase21
namespace CM.Business.Services.DisputeStatusHandler;

public class ParticipatoryDisputeWaitingForOfficePayment : DisputeTransition
{
    public ParticipatoryDisputeWaitingForOfficePayment(IBus messageBus)
        : base(
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.SavedNotSubmitted,
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.OfficePaymentRequired,
            DisputeProcess.ParticipatoryHearing,
            messageBus)
    {
    }

    protected override void Handle(Dispute dispute)
    {
        var creationMethod = (DisputeCreationMethod)dispute.CreationMethod.GetValueOrDefault();
        if (creationMethod == DisputeCreationMethod.OnlineRentIncrease)
        {
            return;
        }

        var assignedTemplate = creationMethod switch
        {
            DisputeCreationMethod.PossessionForRenovation => AssignedTemplate.PfrParticipatoryDisputeWaitingForOfficePayment,
            _ => AssignedTemplate.ParticipatoryDisputeWaitingForOfficePayment
        };

        var message = new EmailGenerateIntegrationEvent
        {
            DisputeGuid = dispute.DisputeGuid,
            MessageType = EmailMessageType.SystemEmail,
            AssignedTemplateId = assignedTemplate
        };

        message.Publish(Bus);
    }
}

public class ParticipatoryDisputeWaitingForOfficePayment2 : DisputeTransition
{
    public ParticipatoryDisputeWaitingForOfficePayment2(IBus messageBus)
        : base(
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.PaymentRequired,
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.OfficePaymentRequired,
            DisputeProcess.ParticipatoryHearing,
            messageBus)
    {
    }

    protected override void Handle(Dispute dispute)
    {
        var creationMethod = (DisputeCreationMethod)dispute.CreationMethod.GetValueOrDefault();
        if (creationMethod == DisputeCreationMethod.OnlineRentIncrease)
        {
            return;
        }

        var assignedTemplate = creationMethod switch
        {
            DisputeCreationMethod.PossessionForRenovation => AssignedTemplate.PfrParticipatoryDisputeWaitingForOfficePayment,
            _ => AssignedTemplate.ParticipatoryDisputeWaitingForOfficePayment
        };

        var message = new EmailGenerateIntegrationEvent
        {
            DisputeGuid = dispute.DisputeGuid,
            MessageType = EmailMessageType.SystemEmail,
            AssignedTemplateId = assignedTemplate
        };

        message.Publish(Bus);
    }
}

public class ParticipatoryDisputeWaitingForOfficePayment3 : DisputeTransition
{
    public ParticipatoryDisputeWaitingForOfficePayment3(IBus messageBus)
        : base(
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.FeeWaiverProofRequired,
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.OfficePaymentRequired,
            DisputeProcess.ParticipatoryHearing,
            messageBus)
    {
    }

    protected override void Handle(Dispute dispute)
    {
        var creationMethod = (DisputeCreationMethod)dispute.CreationMethod.GetValueOrDefault();
        if (creationMethod == DisputeCreationMethod.OnlineRentIncrease)
        {
            return;
        }

        var assignedTemplate = creationMethod switch
        {
            DisputeCreationMethod.PossessionForRenovation => AssignedTemplate.PfrParticipatoryDisputeWaitingForOfficePayment,
            _ => AssignedTemplate.ParticipatoryDisputeWaitingForOfficePayment
        };

        var message = new EmailGenerateIntegrationEvent
        {
            DisputeGuid = dispute.DisputeGuid,
            MessageType = EmailMessageType.SystemEmail,
            AssignedTemplateId = assignedTemplate
        };

        message.Publish(Bus);
    }
}