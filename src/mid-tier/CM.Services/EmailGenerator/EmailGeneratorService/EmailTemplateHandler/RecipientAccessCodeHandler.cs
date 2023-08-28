using System.Text;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.ServiceBase.Exceptions;
using CM.Services.EmailGenerator.EmailGeneratorService.Tags;

namespace CM.Services.EmailGenerator.EmailGeneratorService.EmailTemplateHandler;

public class RecipientAccessCodeHandler : AbstractEmailMessageHandler
{
    public RecipientAccessCodeHandler(IUnitOfWork unitOfWork, int assignedTemplateId)
        : base(unitOfWork, assignedTemplateId)
    {
    }

    public override async Task<StringBuilder> Handle(StringBuilder htmlBody, Dispute dispute, Participant participant)
    {
        if (string.IsNullOrEmpty(participant.AccessCode))
        {
            if (TagDictionary.TagIsExists(htmlBody, TagDictionary.GetTag(Tag.RecipientAccessCode)))
            {
                throw new TagValueMissingException("Tag Value is Missing", dispute.DisputeGuid, AssignedTemplateId, new string[] { TagDictionary.GetTag(Tag.RecipientAccessCode) });
            }
        }

        htmlBody = htmlBody.Replace(TagDictionary.GetTag(Tag.RecipientAccessCode), participant.AccessCode);
        return await base.Handle(htmlBody, dispute, participant);
    }
}