using System.Text;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.ServiceBase.Exceptions;
using CM.Services.EmailGenerator.EmailGeneratorService.Tags;

namespace CM.Services.EmailGenerator.EmailGeneratorService.EmailTemplateHandler;

public class HearingDetailsHandler : AbstractEmailMessageHandler
{
    public HearingDetailsHandler(IUnitOfWork unitOfWork, int assignedTemplateId)
        : base(unitOfWork, assignedTemplateId)
    {
    }

    public override async Task<StringBuilder> Handle(StringBuilder htmlBody, Dispute dispute, Participant participant)
    {
        var hearing = await UnitOfWork.HearingRepository.GetLastHearing(dispute.DisputeGuid);

        if (hearing != null)
        {
            if (hearing.LocalStartDateTime != null)
            {
                htmlBody = htmlBody.Replace(TagDictionary.GetTag(Tag.HearingStartDate), hearing.LocalStartDateTime.Value.Date.ToString("MMMM dd yyyy"));
            }
            else
            {
                if (TagDictionary.TagIsExists(htmlBody, TagDictionary.GetTag(Tag.HearingStartDate)))
                {
                    throw new TagValueMissingException("Tag Value is Missing", dispute.DisputeGuid, AssignedTemplateId, new string[] { TagDictionary.GetTag(Tag.HearingStartDate) });
                }
            }

            if (hearing.LocalStartDateTime != null)
            {
                htmlBody = htmlBody.Replace(TagDictionary.GetTag(Tag.HearingStartTime), hearing.LocalStartDateTime.Value.ToString("hh:mm tt"));
            }
            else
            {
                if (TagDictionary.TagIsExists(htmlBody, TagDictionary.GetTag(Tag.HearingStartTime)))
                {
                    throw new TagValueMissingException("Tag Value is Missing", dispute.DisputeGuid, AssignedTemplateId, new string[] { TagDictionary.GetTag(Tag.HearingStartTime) });
                }
            }

            htmlBody = htmlBody.Replace(TagDictionary.GetTag(Tag.HearingDetails), hearing.HearingDetails);
        }
        else
        {
            if (TagDictionary.TagIsExists(htmlBody, TagDictionary.GetTag(Tag.HearingStartDate)))
            {
                throw new TagValueMissingException("Tag Value is Missing", dispute.DisputeGuid, AssignedTemplateId, new string[] { TagDictionary.GetTag(Tag.HearingStartDate), TagDictionary.GetTag(Tag.HearingStartTime), TagDictionary.GetTag(Tag.HearingDetails) });
            }
        }

        return await base.Handle(htmlBody, dispute, participant);
    }
}