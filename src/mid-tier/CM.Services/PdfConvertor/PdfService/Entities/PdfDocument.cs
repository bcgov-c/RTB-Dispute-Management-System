using CM.Messages.Pdf.Events;

namespace CM.Services.PdfConvertor.PdfService.Entities;

public class PdfDocument
{
    public string Html { get; set; }

    public string HeaderRight { get; set; }

    public string FooterRight { get; set; }

    public PdfDocumentGenerateIntegrationEvent Convert()
    {
        return new PdfDocumentGenerateIntegrationEvent
        {
            Html = Html,
            HeaderRight = HeaderRight,
            FooterRight = FooterRight
        };
    }
}