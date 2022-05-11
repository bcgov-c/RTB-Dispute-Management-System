using AutoMapper;

namespace CM.Services.AdHocReportSender.AdHocReportSenderService.Mapper;

public class MappingProfile : Profile
{
    public static IMapper Init()
    {
        var config = new MapperConfiguration(cfg =>
        {
            cfg.AddProfile(new AdHocDlReportMapping());
        });

        return config.CreateMapper();
    }
}