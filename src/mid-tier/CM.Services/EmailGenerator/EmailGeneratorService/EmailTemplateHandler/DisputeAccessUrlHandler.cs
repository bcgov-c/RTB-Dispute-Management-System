using System.Text;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.Services.EmailGenerator.EmailGeneratorService.Tags;

namespace CM.Services.EmailGenerator.EmailGeneratorService.EmailTemplateHandler;

public class DisputeAccessUrlHandler : AbstractEmailMessageHandler
{
    public DisputeAccessUrlHandler(IUnitOfWork unitOfWork)
        : base(unitOfWork)
    {
    }

    public override async Task<StringBuilder> Handle(StringBuilder htmlBody, Dispute dispute, Participant participant)
    {
        var disputeAccessUrl = await UnitOfWork.SystemSettingsRepository.GetSetting(SettingKeys.DisputeAccessUrl);
        htmlBody = htmlBody.Replace(TagDictionary.GetTag(Tag.DisputeAccessUrl), disputeAccessUrl.Value);
        return await base.Handle(htmlBody, dispute, participant);
    }
}