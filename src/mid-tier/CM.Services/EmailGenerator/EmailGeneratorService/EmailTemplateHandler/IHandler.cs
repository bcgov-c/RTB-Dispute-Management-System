using System.Text;
using System.Threading.Tasks;
using CM.Data.Model;

namespace CM.Services.EmailGenerator.EmailGeneratorService.EmailTemplateHandler;

public interface IHandler
{
    IHandler SetNext(IHandler handler);

    Task<StringBuilder> Handle(StringBuilder htmlBody, Dispute dispute, Participant participant);
}