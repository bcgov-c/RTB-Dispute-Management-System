using CM.Common.Utilities;
using CM.Data.Model;
using CM.Messages.EmailGenerator.Events;
using EasyNetQ;

////UseCase1
////UseCase19
namespace CM.Business.Services.DisputeStatusHandler;

public class ParticipatoryApplicationSubmitted : DisputeTransition
{
    public ParticipatoryApplicationSubmitted(IBus messageBus)
        : base(
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.SavedNotSubmitted,
            DisputeStage.ApplicationScreening,
            DisputeStatuses.Received,
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
            DisputeCreationMethod.PossessionForRenovation => AssignedTemplate.PfrParticipatoryApplicationSubmitted,
            _ => AssignedTemplate.ParticipatoryApplicationSubmitted
        };

        var message = new EmailGenerateIntegrationEvent
        {
            DisputeGuid = dispute.DisputeGuid,
            MessageType = EmailMessageType.SystemEmail,
            AssignedTemplateId = assignedTemplate
        };

        Publish(message);
    }
}

public class ParticipatoryApplicationSubmitted2 : DisputeTransition
{
    public ParticipatoryApplicationSubmitted2(IBus messageBus)
        : base(
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.PaymentRequired,
            DisputeStage.ApplicationScreening,
            DisputeStatuses.Received,
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
            DisputeCreationMethod.PossessionForRenovation => AssignedTemplate.PfrParticipatoryApplicationSubmitted,
            _ => AssignedTemplate.ParticipatoryApplicationSubmitted
        };

        var message = new EmailGenerateIntegrationEvent
        {
            DisputeGuid = dispute.DisputeGuid,
            MessageType = EmailMessageType.SystemEmail,
            AssignedTemplateId = assignedTemplate
        };

        Publish(message);
    }
}

public class ParticipatoryApplicationSubmitted3 : DisputeTransition
{
    public ParticipatoryApplicationSubmitted3(IBus messageBus)
        : base(
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.FeeWaiverProofRequired,
            DisputeStage.ApplicationScreening,
            DisputeStatuses.Received,
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
            DisputeCreationMethod.PossessionForRenovation => AssignedTemplate.PfrParticipatoryApplicationSubmitted,
            _ => AssignedTemplate.ParticipatoryApplicationSubmitted
        };

        var message = new EmailGenerateIntegrationEvent
        {
            DisputeGuid = dispute.DisputeGuid,
            MessageType = EmailMessageType.SystemEmail,
            AssignedTemplateId = assignedTemplate
        };

        Publish(message);
    }
}

public class ParticipatoryApplicationSubmitted4 : DisputeTransition
{
    public ParticipatoryApplicationSubmitted4(IBus messageBus)
        : base(
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.OfficePaymentRequired,
            DisputeStage.ApplicationScreening,
            DisputeStatuses.Received,
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
            DisputeCreationMethod.PossessionForRenovation => AssignedTemplate.PfrParticipatoryApplicationSubmitted,
            _ => AssignedTemplate.ParticipatoryApplicationSubmitted
        };

        var message = new EmailGenerateIntegrationEvent
        {
            DisputeGuid = dispute.DisputeGuid,
            MessageType = EmailMessageType.SystemEmail,
            AssignedTemplateId = assignedTemplate
        };

        Publish(message);
    }
}