using System.Text;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.Services.EmailGenerator.EmailGeneratorService.Tags;

namespace CM.Services.EmailGenerator.EmailGeneratorService.EmailTemplateHandler;

public class InitialSubmissionDateHandler : AbstractEmailMessageHandler
{
    public InitialSubmissionDateHandler(IUnitOfWork unitOfWork)
        : base(unitOfWork)
    {
    }

    public override async Task<StringBuilder> Handle(StringBuilder htmlBody, Dispute dispute, Participant participant)
    {
        if (dispute.SubmittedDate != null)
        {
            htmlBody = htmlBody.Replace(TagDictionary.GetTag(Tag.InitialSubmissionDate), dispute.SubmittedDate.ToPstDateTime());
        }

        return await base.Handle(htmlBody, dispute, participant);
    }
}