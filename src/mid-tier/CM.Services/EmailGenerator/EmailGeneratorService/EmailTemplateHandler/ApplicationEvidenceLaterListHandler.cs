using System;
using System.Text;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.ServiceBase.Exceptions;
using CM.Services.EmailGenerator.EmailGeneratorService.Tags;

namespace CM.Services.EmailGenerator.EmailGeneratorService.EmailTemplateHandler;

public class ApplicationEvidenceLaterListHandler : AbstractEmailMessageHandler
{
    public ApplicationEvidenceLaterListHandler(IUnitOfWork unitOfWork, int assignedTemplateId)
        : base(unitOfWork, assignedTemplateId)
    {
    }

    public override async Task<StringBuilder> Handle(StringBuilder htmlBody, Dispute dispute, Participant participant)
    {
        var fileDescriptions = await UnitOfWork.FileDescriptionRepository.GetFileDescriptionsForEmailAsync(dispute.DisputeGuid);

        if (fileDescriptions.Count > 0)
        {
            var fileDescriptionSnippet = new StringBuilder();

            fileDescriptionSnippet.Append(
                @"<p class=""body - title"" style=""font - size: 16px; line - height: 21px; font - weight: 
                    bold; padding: 0px; margin: 20px 0px 10px 0px; "">You stated that you will provide the following evidence later. 
                    Don't forget to provide this!</p>");

            fileDescriptionSnippet.Append("<ul class=\"sublist\" style=\"padding: 0px 0px 10px 0px; margin: 5px 0px 10px 30px; font - size:16px; line - height: 21px;\">");

            foreach (var fileDescription in fileDescriptions)
            {
                if (string.IsNullOrEmpty(fileDescription.Title) && TagDictionary.TagIsExists(htmlBody, TagDictionary.GetTag(Tag.EvidenceProvidedLater)))
                {
                    throw new TagValueMissingException("Tag Value is Missing", dispute.DisputeGuid, AssignedTemplateId, new string[] { TagDictionary.GetTag(Tag.EvidenceProvidedLater) });
                }

                fileDescriptionSnippet.Append($"<li style=\"padding: 4px 0px 0px 0px; margin: 0px; list - style - type: square; color: #8e8e8e; font-size:16px; line-height: 21px;\"> {fileDescription.Title}</li>");
            }

            fileDescriptionSnippet.Append("</ul>");
            htmlBody = htmlBody.Replace(TagDictionary.GetTag(Tag.EvidenceProvidedLater), fileDescriptionSnippet.ToString());
        }
        else
        {
            htmlBody = htmlBody.Replace(TagDictionary.GetTag(Tag.EvidenceProvidedLater), string.Empty);
        }

        return await base.Handle(htmlBody, dispute, participant);
    }
}