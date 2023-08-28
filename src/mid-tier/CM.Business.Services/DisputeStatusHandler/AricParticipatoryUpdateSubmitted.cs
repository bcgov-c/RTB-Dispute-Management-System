using CM.Business.Services.Base;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Messages.EmailGenerator.Events;
using EasyNetQ;

////UseCase22
namespace CM.Business.Services.DisputeStatusHandler;

public class AricParticipatoryUpdateSubmitted : DisputeTransition
{
    public AricParticipatoryUpdateSubmitted(IBus messageBus)
        : base(
            DisputeStage.ApplicationInProgress,
            DisputeStatuses.UpdateRequired,
            DisputeStage.ApplicationScreening,
            DisputeStatuses.Received,
            DisputeProcess.RentIncrease,
            messageBus)
    {
    }

    protected override void Handle(Dispute dispute)
    {
        var creationMethod = (DisputeCreationMethod)dispute.CreationMethod.GetValueOrDefault();

        if (creationMethod == DisputeCreationMethod.OnlineRentIncrease)
        {
            var message = new EmailGenerateIntegrationEvent
            {
                DisputeGuid = dispute.DisputeGuid,
                MessageType = EmailMessageType.SystemEmail,
                AssignedTemplateId = AssignedTemplate.AricParticipatoryUpdateSubmitted
            };

            message.Publish(Bus);
        }
    }
}