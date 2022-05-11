using System.Text;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.Services.EmailGenerator.EmailGeneratorService.Tags;

namespace CM.Services.EmailGenerator.EmailGeneratorService.EmailTemplateHandler;

public class PrimaryApplicantNameHandler : AbstractEmailMessageHandler
{
    public PrimaryApplicantNameHandler(IUnitOfWork unitOfWork)
        : base(unitOfWork)
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
            else
            {
                htmlBody = htmlBody.Replace(TagDictionary.GetTag(Tag.PrimaryApplicantName), primaryApplicant.FirstName + " " + primaryApplicant.LastName);
            }
        }

        return await base.Handle(htmlBody, dispute, participant);
    }
}