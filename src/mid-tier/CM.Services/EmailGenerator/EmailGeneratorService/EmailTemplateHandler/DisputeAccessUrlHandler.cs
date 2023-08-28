using System.Text;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.ServiceBase.Exceptions;
using CM.Services.EmailGenerator.EmailGeneratorService.Tags;

namespace CM.Services.EmailGenerator.EmailGeneratorService.EmailTemplateHandler;

public class DisputeAccessUrlHandler : AbstractEmailMessageHandler
{
    public DisputeAccessUrlHandler(IUnitOfWork unitOfWork, int assignedTemplateId)
        : base(unitOfWork, assignedTemplateId)
    {
    }

    public override async Task<StringBuilder> Handle(StringBuilder htmlBody, Dispute dispute, Participant participant)
    {
        var disputeAccessUrl = await UnitOfWork.SystemSettingsRepository.GetSetting(SettingKeys.DisputeAccessUrl);

        if ((disputeAccessUrl == null || string.IsNullOrEmpty(disputeAccessUrl.Value)) && TagDictionary.TagIsExists(htmlBody, TagDictionary.GetTag(Tag.DisputeAccessUrl)))
        {
            throw new TagValueMissingException("Tag Value is Missing", dispute.DisputeGuid, AssignedTemplateId, new string[] { TagDictionary.GetTag(Tag.DisputeAccessUrl) });
        }

        htmlBody = htmlBody.Replace(TagDictionary.GetTag(Tag.DisputeAccessUrl), disputeAccessUrl.Value);
        return await base.Handle(htmlBody, dispute, participant);
    }
}