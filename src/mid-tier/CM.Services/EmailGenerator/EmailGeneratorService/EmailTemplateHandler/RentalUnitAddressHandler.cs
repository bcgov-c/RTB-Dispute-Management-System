using System.Text;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.Services.EmailGenerator.EmailGeneratorService.Tags;

namespace CM.Services.EmailGenerator.EmailGeneratorService.EmailTemplateHandler;

public class RentalUnitAddressHandler : AbstractEmailMessageHandler
{
    public RentalUnitAddressHandler(IUnitOfWork unitOfWork)
        : base(unitOfWork)
    {
    }

    public override async Task<StringBuilder> Handle(StringBuilder htmlBody, Dispute dispute, Participant participant)
    {
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