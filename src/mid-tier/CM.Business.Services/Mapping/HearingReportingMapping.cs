using AutoMapper;
using CM.Business.Entities.Models.HearingReporting;
using CM.Common.Utilities;

namespace CM.Business.Services.Mapping;

public class HearingReportingMapping : Profile
{
    public HearingReportingMapping()
    {
        CreateMap<Data.Model.Hearing, HearingReport>()
            .ForMember(x => x.ModeratorCode, opt => opt.MapFrom(src => src.ConferenceBridge.ModeratorCode))
            .ForMember(x => x.ParticipantCode, opt => opt.MapFrom(src => src.ConferenceBridge.ParticipantCode))
            .ForMember(x => x.HearingStartDateTime, opt => opt.MapFrom(src => src.HearingStartDateTime.ToCmDateTimeString()))
            .ForMember(x => x.HearingEndDateTime, opt => opt.MapFrom(src => src.HearingEndDateTime.ToCmDateTimeString()))
            .ForMember(x => x.HearingReservedUntil, opt => opt.MapFrom(src => src.HearingReservedUntil.ToCmDateTimeString()));

        CreateMap<Data.Model.DisputeHearing, HearingReportDispute>()
            .ForMember(x => x.FileNumber, opt => opt.MapFrom(src => src.Dispute.FileNumber));

        CreateMap<Data.Model.Hearing, AvailableHearing>()
            .ForMember(x => x.HearingStartDateTime, opt => opt.MapFrom(src => src.HearingStartDateTime.ToCmDateTimeString()))
            .ForMember(x => x.HearingEndDateTime, opt => opt.MapFrom(src => src.HearingEndDateTime.ToCmDateTimeString()));
    }
}