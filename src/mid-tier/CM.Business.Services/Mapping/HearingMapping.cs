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
            .ForMember(x => x.HearingEndDateTime, opt => opt.MapFrom(src => src.HearingEndDateTime.ToCmDateTimeString()));

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
            .ForMember(x => x.HearingReservedUntil, opt => opt.MapFrom(src => src.HearingReservedUntil.ToCmDateTimeString()));

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
    }
}