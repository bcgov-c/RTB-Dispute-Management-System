using System;

namespace CM.Messages;

public class BaseMessage
{
    public Guid CorrelationGuid { get; set; }
}