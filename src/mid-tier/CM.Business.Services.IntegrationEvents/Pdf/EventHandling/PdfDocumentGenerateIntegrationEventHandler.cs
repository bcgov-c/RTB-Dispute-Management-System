using System;
using System.IO;
using CM.Common.Utilities;
using CM.Messages.Pdf.Events;
using EasyNetQ;

namespace CM.Business.Services.IntegrationEvents.Pdf.EventHandling;

public class PdfDocumentGenerateIntegrationEventHandler
{
    public PdfDocumentGenerateIntegrationEventHandler(IBus bus)
    {
        MessageBus = bus;
    }

    private IBus MessageBus { get; }

    public FileInfo GetPdfFromServiceAsync(string htmlBody, string outputFile, string pageHeader, string pageFooter)
    {
        var pdfDocument = new PdfDocumentGenerateIntegrationEvent
        {
            Html = htmlBody,
            PaperType = PaperTypes.Letter,
            FooterFontName = "Arial",
            HeaderFontName = "Arial",
            HeaderRight = pageHeader,
            FooterRight = pageFooter,
            FooterFontSize = "10",
            HeaderFontSize = "10"
        };

        var pdfFile = MessageBus.Rpc.Request<PdfDocumentGenerateIntegrationEvent, PdfFileGeneratedIntegrationEvent>(pdfDocument);
        if (pdfFile != null)
        {
            var response = pdfFile.FileContentBase64;
            var bytes = Convert.FromBase64String(response);

            FileUtils.CheckIfNotExistsCreate(Path.GetDirectoryName(outputFile));
            File.WriteAllBytes(outputFile, bytes);
            return new FileInfo(outputFile);
        }

        return null;
    }
}

public class PaperTypes
{
    public const string Letter = "Letter";
}