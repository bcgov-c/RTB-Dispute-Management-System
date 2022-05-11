using System;

namespace CM.Messages.DataWarehouse.Events;

public class FactTimeStatisticsIntegrationEvent : BaseMessage
{
    public FactTimeStatisticsIntegrationEvent()
    {
        CorrelationGuid = Guid.NewGuid();
    }
}