using System.Text;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.Services.EmailGenerator.EmailGeneratorService.Tags;

namespace CM.Services.EmailGenerator.EmailGeneratorService.EmailTemplateHandler;

public class HearingDetailsHandler : AbstractEmailMessageHandler
{
    public HearingDetailsHandler(IUnitOfWork unitOfWork)
        : base(unitOfWork)
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

            if (hearing.LocalStartDateTime != null)
            {
                htmlBody = htmlBody.Replace(TagDictionary.GetTag(Tag.HearingStartTime), hearing.LocalStartDateTime.Value.ToString("hh:mm tt"));
            }

            htmlBody = htmlBody.Replace(TagDictionary.GetTag(Tag.HearingDetails), hearing.HearingDetails);
        }

        return await base.Handle(htmlBody, dispute, participant);
    }
}