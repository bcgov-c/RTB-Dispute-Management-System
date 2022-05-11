namespace CM.Services.PdfConvertor.PdfService.Pdf;

public class PdfConvertTimeoutException : PdfConvertException
{
    public PdfConvertTimeoutException()
        : base("HTML to PDF conversion process has not finished in the given period.")
    {
    }
}