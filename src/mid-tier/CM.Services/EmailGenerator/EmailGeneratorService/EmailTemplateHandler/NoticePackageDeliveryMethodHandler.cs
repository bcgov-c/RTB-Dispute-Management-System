using System.Text;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.Services.EmailGenerator.EmailGeneratorService.Tags;

namespace CM.Services.EmailGenerator.EmailGeneratorService.EmailTemplateHandler;

public class NoticePackageDeliveryMethodHandler : AbstractEmailMessageHandler
{
    public NoticePackageDeliveryMethodHandler(IUnitOfWork unitOfWork)
        : base(unitOfWork)
    {
    }

    public override async Task<StringBuilder> Handle(StringBuilder htmlBody, Dispute dispute, Participant participant)
    {
        if (participant.PackageDeliveryMethod != null)
        {
            htmlBody = participant.PackageDeliveryMethod switch
            {
                (byte?)NoticePackageDeliveryMethod.Email => htmlBody.Replace(TagDictionary.GetTag(Tag.NoticePackageDeliveryMethod), "by email"),
                (byte?)NoticePackageDeliveryMethod.OfficePickup => htmlBody.Replace(TagDictionary.GetTag(Tag.NoticePackageDeliveryMethod), "for pickup at the RTB or any Service BC office"),
                _ => htmlBody
            };
        }

        return await base.Handle(htmlBody, dispute, participant);
    }
}