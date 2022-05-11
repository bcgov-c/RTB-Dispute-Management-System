using AutoMapper;

namespace CM.Services.PostedDecision.PostedDecisionDataService.Mapper;

public class MappingProfile : Profile
{
    public static IMapper Init()
    {
        var config = new MapperConfiguration(cfg =>
        {
            cfg.AddProfile(new PostedDecisionMapping());
        });

        return config.CreateMapper();
    }
}