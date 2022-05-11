using System;

namespace CM.Messages.ReconciliationReportGenerator.Events;

public class ReconciliationReportGenerationEvent : BaseMessage
{
    public ReconciliationReportGenerationEvent()
    {
        CorrelationGuid = Guid.NewGuid();
    }
}