using AutoMapper;
using CM.Business.Entities.Models.TrialParticipant;
using CM.Common.Utilities;

namespace CM.Business.Services.Mapping;

public class TrialParticipantMapping : Profile
{
    public TrialParticipantMapping()
    {
        CreateMap<Data.Model.TrialParticipant, PatchTrialParticipantRequest>();
        CreateMap<PatchTrialParticipantRequest, Data.Model.TrialParticipant>();
        CreateMap<PostTrialParticipantRequest, Data.Model.TrialParticipant>();
        CreateMap<Data.Model.TrialParticipant, PostTrialParticipantResponse>()
            .ForMember(x => x.StartDate, opt => opt.MapFrom(src => src.StartDate.ToCmDateTimeString()))
            .ForMember(x => x.EndDate, opt => opt.MapFrom(src => src.EndDate.ToCmDateTimeString()))
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));

        CreateMap<Data.Model.TrialParticipant, TrialParticipantGetResponse>()
            .ForMember(x => x.StartDate, opt => opt.MapFrom(src => src.StartDate.ToCmDateTimeString()))
            .ForMember(x => x.EndDate, opt => opt.MapFrom(src => src.EndDate.ToCmDateTimeString()))
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));
    }
}