using AutoMapper;
using CM.Services.AdHocReportSender.AdHocReportSenderService.Entities;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Mapper;

public class AdHocDlReportMapping : Profile
{
    public AdHocDlReportMapping()
    {
        CreateMap<AdHocDlReportResponse, Models.AdHocDlReport>();
        CreateMap<Models.AdHocDlReport, AdHocDlReportResponse>();

        CreateMap<AdHocDlReportRequest, Models.AdHocDlReport>();
        CreateMap<Models.AdHocDlReport, AdHocDlReportRequest>();
    }
}