using CM.Services.AdHocReportSender.AdHocReportSenderService.ExternalContexts;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Repositories.AdHocReportAttachment
{
    public class AdHocReportAttachmentRepository : AdHocRepositoryBase<Models.AdHocReportAttachment>, IAdHocReportAttachmentRepository
    {
        public AdHocReportAttachmentRepository(AdHocReportContext adHocContext, RtbDmsContext rtbDmsContext)
            : base(adHocContext, rtbDmsContext)
        {
        }
    }
}
