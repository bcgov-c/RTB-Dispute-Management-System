using AutoMapper;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Entities;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Mapper
{
    public class AdHocReportAttachmentMapping : Profile
    {
        public AdHocReportAttachmentMapping()
        {
            CreateMap<AdHocReportAttachmentResponse, Models.AdHocReportAttachment>();
            CreateMap<Models.AdHocReportAttachment, AdHocReportAttachmentResponse>();

            CreateMap<AdHocReportAttachmentRequest, Models.AdHocReportAttachment>();

            CreateMap<Models.AdHocReportAttachment, AdHocReportAttachmentPatchRequest>();
            CreateMap<AdHocReportAttachmentPatchRequest, Models.AdHocReportAttachment>();
        }
    }
}
