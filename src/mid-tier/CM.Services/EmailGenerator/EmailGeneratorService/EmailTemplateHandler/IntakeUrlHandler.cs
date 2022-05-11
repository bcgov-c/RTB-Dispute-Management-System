using System.Text;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.Services.EmailGenerator.EmailGeneratorService.Tags;

namespace CM.Services.EmailGenerator.EmailGeneratorService.EmailTemplateHandler;

public class IntakeUrlHandler : AbstractEmailMessageHandler
{
    public IntakeUrlHandler(IUnitOfWork unitOfWork)
        : base(unitOfWork)
    {
    }

    public override async Task<StringBuilder> Handle(StringBuilder htmlBody, Dispute dispute, Participant participant)
    {
        var intakeUrl = await UnitOfWork.SystemSettingsRepository.GetSetting(SettingKeys.IntakeUrl);
        htmlBody = htmlBody.Replace(TagDictionary.GetTag(Tag.IntakeUrl), intakeUrl.Value);
        return await base.Handle(htmlBody, dispute, participant);
    }
}