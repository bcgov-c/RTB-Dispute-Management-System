using AutoMapper;
using CM.Business.Entities.Models.ExternalUpdate;
using CM.Business.Entities.Models.Parties;
using CM.Common.Utilities;
using CM.Data.Model;

namespace CM.Business.Services.Mapping;

public class PartiesMapping : Profile
{
    public PartiesMapping()
    {
        CreateMap<ClaimGroup, ClaimGroupResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));

        CreateMap<Participant, ParticipantResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.AcceptedTouDate, opt => opt.MapFrom(src => src.AcceptedTouDate.ToCmDateTimeString()));
        CreateMap<ParticipantRequest, Participant>();
        CreateMap<Participant, ParticipantRequest>();
        CreateMap<ExternalUpdateParticipantRequest, Participant>();
        CreateMap<Participant, ExternalUpdateParticipantRequest>();

        CreateMap<ClaimGroupParticipant, ClaimGroupParticipantResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));
        CreateMap<ClaimGroupParticipant, ClaimGroupParticipantRequest>();
        CreateMap<ClaimGroupParticipantRequest, ClaimGroupParticipant>();

        CreateMap<Participant, DisputeParticipantResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));
        CreateMap<Participant, ExternalUpdateParticipantResponse>()
            .ForMember(x => x.Email, opt => opt.MapFrom(src => src.Email.ToEmailHint()))
            .ForMember(x => x.PrimaryPhone, opt => opt.MapFrom(src => src.PrimaryPhone.ToPhoneHint()))
            .ForMember(x => x.SecondaryPhone, opt => opt.MapFrom(src => src.SecondaryPhone.ToPhoneHint()))
            .ForMember(x => x.Fax, opt => opt.MapFrom(src => src.Fax.ToPhoneHint()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.AcceptedTouDate, opt => opt.MapFrom(src => src.AcceptedTouDate.ToCmDateTimeString()));
        CreateMap<ClaimGroupParticipant, DisputeParticipantResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));
    }
}