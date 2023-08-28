using AutoMapper;
using CM.Business.Entities.Models.Hearing;
using CM.Business.Entities.Models.OfficeUser;
using CM.Common.Utilities;
using CM.Data.Model;

namespace CM.Business.Services.Mapping;

public class HearingParticipationMapping : Profile
{
    public HearingParticipationMapping()
    {
        CreateMap<HearingParticipation, HearingParticipationRequest>();
        CreateMap<HearingParticipationRequest, HearingParticipation>();

        CreateMap<HearingParticipation, HearingParticipationResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.PreParticipationStatusDate, opt => opt.MapFrom(src => src.PreParticipationStatusDate.ToCmDateTimeString()));

        CreateMap<HearingParticipation, OfficeUserPatchHearingParticipantRequest>();
        CreateMap<OfficeUserPatchHearingParticipantRequest, HearingParticipation>();

        CreateMap<ExternalHearingParticipationRequest, HearingParticipation>();
        CreateMap<HearingParticipation, ExternalHearingParticipationResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.PreParticipationStatusDate, opt => opt.MapFrom(src => src.PreParticipationStatusDate.ToCmDateTimeString()));
    }
}