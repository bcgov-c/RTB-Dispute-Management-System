using System;
using System.IO;
using CM.Messages.Pdf.Events;
using CM.Services.PdfConvertor.PdfService.Pdf;
using Serilog;

namespace CM.Services.PdfConvertor.PdfService.IntegrationEvents.EventHandling;

public class PdfFileGenerateIntegrationEventHandler
{
    public static PdfFileGeneratedIntegrationEvent ConsumeAsync(PdfDocumentGenerateIntegrationEvent message)
    {
        Log.Debug("Pdf File Generate Integration Event Received: {DisputeGuid}", message.DisputeGuid);

        var pdfOutput = new PdfOutput
        {
            OutputStream = new MemoryStream()
        };

        PdfConvert.ConvertHtmlToPdf(message, pdfOutput);

        var bytes = ((MemoryStream)pdfOutput.OutputStream).ToArray();

        pdfOutput.OutputStream.Close();

        var base64File = Convert.ToBase64String(bytes);

        var pdfFile = new PdfFileGeneratedIntegrationEvent
        {
            DisputeGuid = message.DisputeGuid,
            FileContentBase64 = base64File
        };

        return pdfFile;
    }
}