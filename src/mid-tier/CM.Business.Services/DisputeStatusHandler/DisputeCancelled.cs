using CM.Business.Services.Base;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Messages.EmailGenerator.Events;
using EasyNetQ;

////UseCase9
namespace CM.Business.Services.DisputeStatusHandler;

public class DisputeCancelled : DisputeTransition
{
    public DisputeCancelled(IBus messageBus)
        : base(
            DisputeStage.Any,
            DisputeStatuses.Any,
            DisputeStage.ApplicationScreening,
            DisputeStatuses.CancelledByRtb,
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
            AssignedTemplateId = AssignedTemplate.DisputeCancelled
        };

        message.Publish(Bus);
    }
}