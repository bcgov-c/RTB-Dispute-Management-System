using AutoMapper;
using CM.Business.Entities.Models.TrialDispute;
using CM.Common.Utilities;

namespace CM.Business.Services.Mapping;

public class TrialDisputeMapping : Profile
{
    public TrialDisputeMapping()
    {
        CreateMap<Data.Model.TrialDispute, PatchTrialDisputeRequest>();
        CreateMap<PatchTrialDisputeRequest, Data.Model.TrialDispute>();
        CreateMap<PostTrialDisputeRequest, Data.Model.TrialDispute>();
        CreateMap<Data.Model.TrialDispute, PostTrialDisputeResponse>()
            .ForMember(x => x.StartDate, opt => opt.MapFrom(src => src.StartDate.ToCmDateTimeString()))
            .ForMember(x => x.EndDate, opt => opt.MapFrom(src => src.EndDate.ToCmDateTimeString()))
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));

        CreateMap<Data.Model.TrialDispute, TrialDisputeGetResponse>()
            .ForMember(x => x.StartDate, opt => opt.MapFrom(src => src.StartDate.ToCmDateTimeString()))
            .ForMember(x => x.EndDate, opt => opt.MapFrom(src => src.EndDate.ToCmDateTimeString()))
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));
    }
}