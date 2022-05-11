using System;

namespace CM.Messages.PostedDecision.Events;

public class PostedDecisionRemovalEvent : BaseMessage
{
    public PostedDecisionRemovalEvent()
    {
        CorrelationGuid = Guid.NewGuid();
    }

    public Guid DisputeGuid { get; set; }

    public int OutcomeDocFileId { get; set; }
}