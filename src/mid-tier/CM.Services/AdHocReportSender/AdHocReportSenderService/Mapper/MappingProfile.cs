using AutoMapper;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Mapper;

public class MappingProfile : Profile
{
    public static IMapper Init()
    {
        var config = new MapperConfiguration(cfg =>
        {
            cfg.AddProfile(new AdHocDlReportMapping());
            cfg.AddProfile(new AdHocReportMapping());
            cfg.AddProfile(new AdHocReportAttachmentMapping());
        });

        return config.CreateMapper();
    }
}