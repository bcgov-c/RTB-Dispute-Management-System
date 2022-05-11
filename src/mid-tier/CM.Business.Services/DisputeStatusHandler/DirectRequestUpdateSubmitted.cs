using CM.Common.Utilities;
using CM.Data.Model;
using CM.Messages.EmailGenerator.Events;
using EasyNetQ;

////UseCase13
namespace CM.Business.Services.DisputeStatusHandler;

public class DirectRequestUpdateSubmitted : DisputeTransition
{
    public DirectRequestUpdateSubmitted(IBus messageBus)
        : base(
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.UpdateRequired,
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
            AssignedTemplateId = AssignedTemplate.DirectRequestUpdateSubmitted
        };

        Publish(message);
    }
}