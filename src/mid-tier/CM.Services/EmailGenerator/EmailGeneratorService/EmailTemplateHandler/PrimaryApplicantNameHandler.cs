using System.Text;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.ServiceBase.Exceptions;
using CM.Services.EmailGenerator.EmailGeneratorService.Tags;

namespace CM.Services.EmailGenerator.EmailGeneratorService.EmailTemplateHandler;

public class PrimaryApplicantNameHandler : AbstractEmailMessageHandler
{
    public PrimaryApplicantNameHandler(IUnitOfWork unitOfWork, int assignedTemplateId)
        : base(unitOfWork, assignedTemplateId)
    {
    }

    public override async Task<StringBuilder> Handle(StringBuilder htmlBody, Dispute dispute, Participant participant)
    {
        var primaryApplicant = await UnitOfWork.ParticipantRepository.GetPrimaryApplicantAsync(dispute.DisputeGuid);
        if (primaryApplicant != null)
        {
            if (primaryApplicant.BusinessContactFirstName != null && primaryApplicant.BusinessContactLastName != null)
            {
                htmlBody = htmlBody.Replace(TagDictionary.GetTag(Tag.PrimaryApplicantName), primaryApplicant.BusinessContactFirstName + " " + primaryApplicant.BusinessContactLastName);
            }
            else if (primaryApplicant.FirstName != null && primaryApplicant.LastName != null)
            {
                htmlBody = htmlBody.Replace(TagDictionary.GetTag(Tag.PrimaryApplicantName), primaryApplicant.FirstName + " " + primaryApplicant.LastName);
            }
            else
            {
                if (TagDictionary.TagIsExists(htmlBody, TagDictionary.GetTag(Tag.PrimaryApplicantName)))
                {
                    throw new TagValueMissingException("Tag Value is Missing", dispute.DisputeGuid, AssignedTemplateId, new string[] { TagDictionary.GetTag(Tag.PrimaryApplicantName) });
                }
            }
        }
        else
        {
            if (TagDictionary.TagIsExists(htmlBody, TagDictionary.GetTag(Tag.PrimaryApplicantName)))
            {
                throw new TagValueMissingException("Tag Value is Missing", dispute.DisputeGuid, AssignedTemplateId, new string[] { TagDictionary.GetTag(Tag.PrimaryApplicantName) });
            }
        }

        return await base.Handle(htmlBody, dispute, participant);
    }
}