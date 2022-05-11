using System;

namespace CM.Messages.DataWarehouse.Events;

public class DataWarehouseIntegrationEvent : BaseMessage
{
    public DataWarehouseIntegrationEvent()
    {
        CorrelationGuid = Guid.NewGuid();
    }
}