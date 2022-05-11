using AutoMapper;
using CM.Business.Entities.Models.TrialOutcome;
using CM.Common.Utilities;

namespace CM.Business.Services.Mapping;

public class TrialOutcomeMapping : Profile
{
    public TrialOutcomeMapping()
    {
        CreateMap<Data.Model.TrialOutcome, PatchTrialOutcomeRequest>();
        CreateMap<PatchTrialOutcomeRequest, Data.Model.TrialOutcome>();
        CreateMap<PostTrialOutcomeRequest, Data.Model.TrialOutcome>();
        CreateMap<Data.Model.TrialOutcome, PostTrialOutcomeResponse>()
            .ForMember(x => x.StartDate, opt => opt.MapFrom(src => src.StartDate.ToCmDateTimeString()))
            .ForMember(x => x.EndDate, opt => opt.MapFrom(src => src.EndDate.ToCmDateTimeString()))
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));

        CreateMap<Data.Model.TrialOutcome, TrialOutcomeGetResponse>()
            .ForMember(x => x.StartDate, opt => opt.MapFrom(src => src.StartDate.ToCmDateTimeString()))
            .ForMember(x => x.EndDate, opt => opt.MapFrom(src => src.EndDate.ToCmDateTimeString()))
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));
    }
}