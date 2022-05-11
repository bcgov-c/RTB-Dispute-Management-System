using System;
using System.IO;
using CM.Messages.Pdf.Events;

namespace CM.Services.PdfConvertor.PdfService.Pdf;

public class PdfOutput
{
    public string OutputFilePath { get; set; }

    public Stream OutputStream { get; set; }

    public Action<PdfDocumentGenerateIntegrationEvent, byte[]> OutputCallback { get; set; }
}