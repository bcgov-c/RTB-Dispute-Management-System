using System.Text;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.ServiceBase.Exceptions;
using CM.Services.EmailGenerator.EmailGeneratorService.Tags;

namespace CM.Services.EmailGenerator.EmailGeneratorService.EmailTemplateHandler;

public class IntakeUrlHandler : AbstractEmailMessageHandler
{
    public IntakeUrlHandler(IUnitOfWork unitOfWork, int assignedTemplateId)
        : base(unitOfWork, assignedTemplateId)
    {
    }

    public override async Task<StringBuilder> Handle(StringBuilder htmlBody, Dispute dispute, Participant participant)
    {
        var intakeUrl = await UnitOfWork.SystemSettingsRepository.GetSetting(SettingKeys.IntakeUrl);
        if ((intakeUrl == null || string.IsNullOrEmpty(intakeUrl.Value)) && TagDictionary.TagIsExists(htmlBody, TagDictionary.GetTag(Tag.IntakeUrl)))
        {
            throw new TagValueMissingException("Tag Value is Missing", dispute.DisputeGuid, AssignedTemplateId, new string[] { TagDictionary.GetTag(Tag.IntakeUrl) });
        }

        htmlBody = htmlBody.Replace(TagDictionary.GetTag(Tag.IntakeUrl), intakeUrl.Value);
        return await base.Handle(htmlBody, dispute, participant);
    }
}