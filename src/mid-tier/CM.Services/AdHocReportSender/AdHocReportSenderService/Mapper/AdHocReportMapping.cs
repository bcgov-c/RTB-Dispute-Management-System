using AutoMapper;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Entities;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Mapper
{
    public class AdHocReportMapping : Profile
    {
        public AdHocReportMapping()
        {
            CreateMap<AdHocReportEmailResponse, Models.AdHocReport>();
            CreateMap<Models.AdHocReport, AdHocReportEmailResponse>();

            CreateMap<AdHocReportEmailRequest, Models.AdHocReport>();

            CreateMap<Models.AdHocReport, AdHocReportEmailGetResponse>();
        }
    }
}
