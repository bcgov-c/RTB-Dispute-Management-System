using System;

namespace CM.Messages.DataWarehouse.Events;

public class FactHearingSummaryIntegrationEvent : BaseMessage
{
    public FactHearingSummaryIntegrationEvent()
    {
        CorrelationGuid = Guid.NewGuid();
    }
}