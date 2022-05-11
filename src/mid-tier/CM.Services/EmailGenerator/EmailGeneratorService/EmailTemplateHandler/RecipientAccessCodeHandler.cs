using System.Text;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.Services.EmailGenerator.EmailGeneratorService.Tags;

namespace CM.Services.EmailGenerator.EmailGeneratorService.EmailTemplateHandler;

public class RecipientAccessCodeHandler : AbstractEmailMessageHandler
{
    public RecipientAccessCodeHandler(IUnitOfWork unitOfWork)
        : base(unitOfWork)
    {
    }

    public override async Task<StringBuilder> Handle(StringBuilder htmlBody, Dispute dispute, Participant participant)
    {
        htmlBody = htmlBody.Replace(TagDictionary.GetTag(Tag.RecipientAccessCode), participant.AccessCode);
        return await base.Handle(htmlBody, dispute, participant);
    }
}