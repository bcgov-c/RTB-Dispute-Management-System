using AutoMapper;
using CM.Business.Entities.Models.AccessCode;
using CM.Business.Entities.Models.DisputeHearing;
using CM.Business.Entities.Models.Hearing;
using CM.Common.Utilities;
using CM.Data.Model;

namespace CM.Business.Services.Mapping;

public class HearingMapping : Profile
{
    public HearingMapping()
    {
        CreateMap<Hearing, HearingRequest>();
        CreateMap<HearingRequest, Hearing>();

        CreateMap<Hearing, HearingPatchRequest>();
        CreateMap<HearingPatchRequest, Hearing>();

        CreateMap<Hearing, HearingResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.HearingStartDateTime, opt => opt.MapFrom(src => src.HearingStartDateTime.ToCmDateTimeString()))
            .ForMember(x => x.HearingEndDateTime, opt => opt.MapFrom(src => src.HearingEndDateTime.ToCmDateTimeString()))
            .ForMember(x => x.NotificationDeliveryDate, opt => opt.MapFrom(src => src.NotificationDeliveryDate.ToCmDateTimeString()));

        CreateMap<Hearing, DisputeListHearingResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.HearingStartDateTime, opt => opt.MapFrom(src => src.HearingStartDateTime.ToCmDateTimeString()))
            .ForMember(x => x.HearingEndDateTime, opt => opt.MapFrom(src => src.HearingEndDateTime.ToCmDateTimeString()));

        CreateMap<Hearing, DisputeAccessHearing>()
            .ForMember(x => x.HearingEnd, opt => opt.MapFrom(src => src.HearingEndDateTime.ToCmDateTimeString()))
            .ForMember(x => x.HearingStart, opt => opt.MapFrom(src => src.HearingStartDateTime.ToCmDateTimeString()));

        CreateMap<Hearing, DisputeHearingGetResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.HearingStartDateTime, opt => opt.MapFrom(src => src.HearingStartDateTime.ToCmDateTimeString()))
            .ForMember(x => x.HearingEndDateTime, opt => opt.MapFrom(src => src.HearingEndDateTime.ToCmDateTimeString()))
            .ForMember(x => x.HearingReservedUntil, opt => opt.MapFrom(src => src.HearingReservedUntil.ToCmDateTimeString()))
            .ForMember(x => x.NotificationDeliveryDate, opt => opt.MapFrom(src => src.NotificationDeliveryDate.ToCmDateTimeString()));

        CreateMap<ImportScheduleRequest, HearingImport>();

        CreateMap<HearingImport, ImportScheduleResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.ImportStartDateTime, opt => opt.MapFrom(src => src.ImportStartDateTime.ToCmDateTimeString()))
            .ForMember(x => x.ImportEndDateTime, opt => opt.MapFrom(src => src.ImportEndDateTime.ToCmDateTimeString()));

        CreateMap<Hearing, SameDayHearing>()
            .ForMember(x => x.HearingStartDateTime, opt => opt.MapFrom(src => src.HearingStartDateTime.ToCmDateTimeString()))
            .ForMember(x => x.HearingEndDateTime, opt => opt.MapFrom(src => src.HearingEndDateTime.ToCmDateTimeString()));

        CreateMap<Hearing, ReserveAvailableHearingResponse>()
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.HearingStartDateTime, opt => opt.MapFrom(src => src.HearingStartDateTime.ToCmDateTimeString()))
            .ForMember(x => x.HearingEndDateTime, opt => opt.MapFrom(src => src.HearingEndDateTime.ToCmDateTimeString()))
            .ForMember(x => x.LocalStartDateTime, opt => opt.MapFrom(src => src.LocalStartDateTime.ToCmDateTimeString()))
            .ForMember(x => x.LocalEndDateTime, opt => opt.MapFrom(src => src.LocalEndDateTime.ToCmDateTimeString()))
            .ForMember(x => x.HearingReservedUntil, opt => opt.MapFrom(src => src.HearingReservedUntil.ToCmDateTimeString()));

        CreateMap<Hearing, OnHoldHearingResponse>()
            .ForMember(x => x.HearingStartDateTime, opt => opt.MapFrom(src => src.HearingStartDateTime.ToCmDateTimeString()))
            .ForMember(x => x.HearingEndDateTime, opt => opt.MapFrom(src => src.HearingEndDateTime.ToCmDateTimeString()))
            .ForMember(x => x.LocalStartDateTime, opt => opt.MapFrom(src => src.LocalStartDateTime.ToCmDateTimeString()))
            .ForMember(x => x.LocalEndDateTime, opt => opt.MapFrom(src => src.LocalEndDateTime.ToCmDateTimeString()))
            .ForMember(x => x.HearingReservedUntil, opt => opt.MapFrom(src => src.HearingReservedUntil.ToCmDateTimeString()));

        CreateMap<Hearing, ExternalDisputeHearingGetResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.HearingStartDateTime, opt => opt.MapFrom(src => src.HearingStartDateTime.ToCmDateTimeString()))
            .ForMember(x => x.HearingEndDateTime, opt => opt.MapFrom(src => src.HearingEndDateTime.ToCmDateTimeString()))
            .ForMember(x => x.DialInNumber1, opt => opt.MapFrom(src => src.ConferenceBridge.DialInNumber1))
            .ForMember(x => x.DialInDescription1, opt => opt.MapFrom(src => src.ConferenceBridge.DialInDescription1))
            .ForMember(x => x.DialInNumber2, opt => opt.MapFrom(src => src.ConferenceBridge.DialInNumber2))
            .ForMember(x => x.DialInDescription2, opt => opt.MapFrom(src => src.ConferenceBridge.DialInDescription2))
            .ForMember(x => x.ParticipantCode, opt => opt.MapFrom(src => src.ConferenceBridge.ParticipantCode));
    }
}