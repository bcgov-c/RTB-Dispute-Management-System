using System;

namespace CM.Messages.DataWarehouse.Events;

public class FactIntakeProcessingIntegrationEvent : BaseMessage
{
    public FactIntakeProcessingIntegrationEvent()
    {
        CorrelationGuid = Guid.NewGuid();
    }
}