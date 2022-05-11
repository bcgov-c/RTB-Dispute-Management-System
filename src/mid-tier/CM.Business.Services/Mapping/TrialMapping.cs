using AutoMapper;
using CM.Business.Entities.Models.Trial;
using CM.Common.Utilities;

namespace CM.Business.Services.Mapping;

public class TrialMapping : Profile
{
    public TrialMapping()
    {
        CreateMap<Data.Model.Trial, PatchTrialRequest>();
        CreateMap<PatchTrialRequest, Data.Model.Trial>();
        CreateMap<PostTrialRequest, Data.Model.Trial>();
        CreateMap<Data.Model.Trial, PostTrialResponse>()
            .ForMember(x => x.TrialStartDate, opt => opt.MapFrom(src => src.TrialStartDate.ToCmDateTimeString()))
            .ForMember(x => x.TrialEndDate, opt => opt.MapFrom(src => src.TrialEndDate.ToCmDateTimeString()))
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));
    }
}