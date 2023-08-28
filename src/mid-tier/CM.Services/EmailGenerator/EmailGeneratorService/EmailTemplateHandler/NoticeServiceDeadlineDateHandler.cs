using System;
using System.Text;
using System.Threading.Tasks;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;
using CM.ServiceBase.Exceptions;
using CM.Services.EmailGenerator.EmailGeneratorService.Tags;

namespace CM.Services.EmailGenerator.EmailGeneratorService.EmailTemplateHandler
{
    public class NoticeServiceDeadlineDateHandler : AbstractEmailMessageHandler
    {
        public NoticeServiceDeadlineDateHandler(IUnitOfWork unitOfWork, int assignedTemplateId)
        : base(unitOfWork, assignedTemplateId)
        {
        }

        public override async Task<StringBuilder> Handle(StringBuilder htmlBody, Dispute dispute, Participant participant)
        {
            var notice = await UnitOfWork.NoticeRepository.GetCurrentNotice(dispute.DisputeGuid);

            if (notice != null)
            {
                var timezone = TimeZoneInfo.FindSystemTimeZoneById("Pacific Standard Time");

                var pstServiceDeadlineDate = notice.ServiceDeadlineDate.HasValue ?
                    TimeZoneInfo.ConvertTime(notice.ServiceDeadlineDate.Value, timezone).ToString("MMM dd, yyyy HH:MM tt")
                    : string.Empty;
                var pstSecondServiceDeadlineDate = notice.SecondServiceDeadlineDate.HasValue ?
                    TimeZoneInfo.ConvertTime(notice.SecondServiceDeadlineDate.Value, timezone).ToString("MMM dd, yyyy HH:MM tt")
                    : string.Empty;

                if (string.IsNullOrEmpty(pstServiceDeadlineDate))
                {
                    if (TagDictionary.TagIsExists(htmlBody, TagDictionary.GetTag(Tag.NoticeServiceDeadlineDate)))
                    {
                        throw new TagValueMissingException("Tag Value is Missing", dispute.DisputeGuid, AssignedTemplateId, new string[] { TagDictionary.GetTag(Tag.NoticeServiceDeadlineDate) });
                    }
                }
                else if (string.IsNullOrEmpty(pstServiceDeadlineDate))
                {
                    if (TagDictionary.TagIsExists(htmlBody, TagDictionary.GetTag(Tag.NoticeServiceSecondServiceDeadlineDate)))
                    {
                        throw new TagValueMissingException("Tag Value is Missing", dispute.DisputeGuid, AssignedTemplateId, new string[] { TagDictionary.GetTag(Tag.NoticeServiceSecondServiceDeadlineDate) });
                    }
                }

                htmlBody.Replace(TagDictionary.GetTag(Tag.NoticeServiceDeadlineDate), pstServiceDeadlineDate);
                htmlBody.Replace(TagDictionary.GetTag(Tag.NoticeServiceSecondServiceDeadlineDate), pstSecondServiceDeadlineDate);
            }
            else
            {
                if (TagDictionary.TagIsExists(htmlBody, TagDictionary.GetTag(Tag.NoticeServiceDeadlineDate)))
                {
                    throw new TagValueMissingException("Tag Value is Missing", dispute.DisputeGuid, AssignedTemplateId, new string[] { TagDictionary.GetTag(Tag.NoticeServiceDeadlineDate), TagDictionary.GetTag(Tag.NoticeServiceSecondServiceDeadlineDate) });
                }
            }

            return await base.Handle(htmlBody, dispute, participant);
        }
    }
}
