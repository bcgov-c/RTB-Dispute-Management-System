using System;
using CM.Common.Utilities;

namespace CM.Messages.EmailGenerator.Events;

public class EmailGenerateIntegrationEvent : BaseMessage
{
    public EmailGenerateIntegrationEvent()
    {
        CorrelationGuid = Guid.NewGuid();
    }

    public Guid DisputeGuid { get; set; }

    public AssignedTemplate AssignedTemplateId { get; set; }

    public EmailMessageType MessageType { get; set; }

    public int ParticipantId { get; set; }
}