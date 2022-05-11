using System.Collections.Generic;

namespace CM.Messages.ReconciliationReportSender.Events;

public class ReconciliationReportSenderEvent : BaseMessage
{
    public string FileName { get; set; }

    public List<int> PaymentTransactionIds { get; set; }
}