using System.Text;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.ServiceBase.Exceptions;
using CM.Services.EmailGenerator.EmailGeneratorService.Tags;

namespace CM.Services.EmailGenerator.EmailGeneratorService.EmailTemplateHandler;

public class InitialSubmissionDateHandler : AbstractEmailMessageHandler
{
    public InitialSubmissionDateHandler(IUnitOfWork unitOfWork, int assignedTemplateId)
        : base(unitOfWork, assignedTemplateId)
    {
    }

    public override async Task<StringBuilder> Handle(StringBuilder htmlBody, Dispute dispute, Participant participant)
    {
        if (dispute.SubmittedDate != null)
        {
            htmlBody = htmlBody.Replace(TagDictionary.GetTag(Tag.InitialSubmissionDate), dispute.SubmittedDate.ToPstDateTime());
        }
        else
        {
            if (TagDictionary.TagIsExists(htmlBody, TagDictionary.GetTag(Tag.InitialSubmissionDate)))
            {
                throw new TagValueMissingException("Tag Value is Missing", dispute.DisputeGuid, AssignedTemplateId, new string[] { TagDictionary.GetTag(Tag.InitialSubmissionDate) });
            }
        }

        return await base.Handle(htmlBody, dispute, participant);
    }
}