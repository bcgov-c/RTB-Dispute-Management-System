using System.Text;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.ServiceBase.Exceptions;
using CM.Services.EmailGenerator.EmailGeneratorService.Tags;

namespace CM.Services.EmailGenerator.EmailGeneratorService.EmailTemplateHandler;

public class RentalUnitAddressHandler : AbstractEmailMessageHandler
{
    public RentalUnitAddressHandler(IUnitOfWork unitOfWork, int assignedTemplateId)
        : base(unitOfWork, assignedTemplateId)
    {
    }

    public override async Task<StringBuilder> Handle(StringBuilder htmlBody, Dispute dispute, Participant participant)
    {
        if (string.IsNullOrEmpty(dispute.TenancyAddress) ||
            string.IsNullOrEmpty(dispute.TenancyCity) ||
            string.IsNullOrEmpty(dispute.TenancyCountry) ||
            string.IsNullOrEmpty(dispute.TenancyZipPostal))
        {
            if (TagDictionary.TagIsExists(htmlBody, TagDictionary.GetTag(Tag.RentalUnitAddress)))
            {
                throw new TagValueMissingException("Tag Value is Missing", dispute.DisputeGuid, AssignedTemplateId, new string[] { TagDictionary.GetTag(Tag.RentalUnitAddress) });
            }
        }

        var rentalUnitAddress = new StringBuilder();
        rentalUnitAddress.Append(dispute.TenancyAddress);
        rentalUnitAddress.Append(", ");
        rentalUnitAddress.Append(dispute.TenancyCity);
        rentalUnitAddress.Append(", ");
        rentalUnitAddress.Append("BC");
        rentalUnitAddress.Append(", ");
        rentalUnitAddress.Append(dispute.TenancyCountry);
        rentalUnitAddress.Append(", ");
        rentalUnitAddress.Append(dispute.TenancyZipPostal);

        htmlBody = htmlBody.Replace(TagDictionary.GetTag(Tag.RentalUnitAddress), rentalUnitAddress.ToString());
        return await base.Handle(htmlBody, dispute, participant);
    }
}