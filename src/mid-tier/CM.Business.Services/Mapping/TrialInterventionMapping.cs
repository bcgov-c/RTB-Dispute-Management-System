using AutoMapper;
using CM.Business.Entities.Models.TrialIntervention;
using CM.Common.Utilities;

namespace CM.Business.Services.Mapping;

public class TrialInterventionMapping : Profile
{
    public TrialInterventionMapping()
    {
        CreateMap<Data.Model.TrialIntervention, PatchTrialInterventionRequest>();
        CreateMap<PatchTrialInterventionRequest, Data.Model.TrialIntervention>();
        CreateMap<PostTrialInterventionRequest, Data.Model.TrialIntervention>();
        CreateMap<Data.Model.TrialIntervention, PostTrialInterventionResponse>()
            .ForMember(x => x.StartDate, opt => opt.MapFrom(src => src.StartDate.ToCmDateTimeString()))
            .ForMember(x => x.EndDate, opt => opt.MapFrom(src => src.EndDate.ToCmDateTimeString()))
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));

        CreateMap<Data.Model.TrialIntervention, TrialInterventionGetResponse>()
            .ForMember(x => x.StartDate, opt => opt.MapFrom(src => src.StartDate.ToCmDateTimeString()))
            .ForMember(x => x.EndDate, opt => opt.MapFrom(src => src.EndDate.ToCmDateTimeString()))
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));
    }
}