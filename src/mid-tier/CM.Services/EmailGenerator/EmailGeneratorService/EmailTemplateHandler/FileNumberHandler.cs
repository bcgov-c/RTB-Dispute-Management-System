using System.Text;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.Services.EmailGenerator.EmailGeneratorService.Tags;

namespace CM.Services.EmailGenerator.EmailGeneratorService.EmailTemplateHandler;

public class FileNumberHandler : AbstractEmailMessageHandler
{
    public FileNumberHandler(IUnitOfWork unitOfWork)
        : base(unitOfWork)
    {
    }

    public override async Task<StringBuilder> Handle(StringBuilder htmlBody, Dispute dispute, Participant participant)
    {
        htmlBody = htmlBody.Replace(TagDictionary.GetTag(Tag.FileNumber), dispute.FileNumber.ToString());
        return await base.Handle(htmlBody, dispute, participant);
    }
}