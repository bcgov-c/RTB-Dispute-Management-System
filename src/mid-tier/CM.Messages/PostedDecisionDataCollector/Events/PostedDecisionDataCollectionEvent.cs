using System;

namespace CM.Messages.PostedDecisionDataCollector.Events;

public class PostedDecisionDataCollectionEvent : BaseMessage
{
    public PostedDecisionDataCollectionEvent()
    {
        CorrelationGuid = Guid.NewGuid();
    }

    public Guid DisputeGuid { get; set; }

    public int OutcomeDocFileId { get; set; }

    public int PostedBy { get; set; }

    public Guid FileGuid { get; set; }
}