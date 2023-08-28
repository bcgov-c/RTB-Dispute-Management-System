using CM.Business.Services.Base;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Messages.EmailGenerator.Events;
using EasyNetQ;

////UseCase10, 23
namespace CM.Business.Services.DisputeStatusHandler;

public class ParticipatoryUpdateSubmitted : DisputeTransition
{
    public ParticipatoryUpdateSubmitted(IBus messageBus)
        : base(
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.UpdateRequired,
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
            DisputeCreationMethod.PossessionForRenovation => AssignedTemplate.PfrParticipatoryUpdateSubmitted,
            _ => AssignedTemplate.ParticipatoryUpdateSubmitted
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