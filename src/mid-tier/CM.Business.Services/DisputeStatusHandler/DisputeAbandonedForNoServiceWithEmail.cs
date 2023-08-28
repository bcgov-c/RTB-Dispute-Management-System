using CM.Business.Services.Base;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Messages.EmailGenerator.Events;
using EasyNetQ;

////UseCase16
namespace CM.Business.Services.DisputeStatusHandler;

public class DisputeAbandonedForNoServiceWithEmail : DisputeTransition
{
    public DisputeAbandonedForNoServiceWithEmail(IBus messageBus)
        : base(
            DisputeStage.ServingDocuments,
            DisputeStatuses.WaitingForProofOfService,
            DisputeStage.ServingDocuments,
            DisputeStatuses.AbandonedApplicantInaction,
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
            AssignedTemplateId = AssignedTemplate.DisputeAbandonedDueToApplicantServiceInaction
        };

        message.Publish(Bus);
    }
}