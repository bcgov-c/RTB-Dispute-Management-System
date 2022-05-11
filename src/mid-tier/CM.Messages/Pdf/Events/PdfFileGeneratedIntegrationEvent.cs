using System;

namespace CM.Messages.Pdf.Events;

public class PdfFileGeneratedIntegrationEvent : BaseMessage
{
    public Guid DisputeGuid { get; set; }

    public string FileContentBase64 { get; set; }
}