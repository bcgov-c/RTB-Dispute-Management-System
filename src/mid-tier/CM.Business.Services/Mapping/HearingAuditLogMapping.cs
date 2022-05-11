using AutoMapper;
using CM.Business.Entities.Models.HearingAuditLog;
using CM.Common.Utilities;
using CM.Data.Model;

namespace CM.Business.Services.Mapping;

public class HearingAuditLogMapping : Profile
{
    public HearingAuditLogMapping()
    {
        CreateMap<HearingAuditLog, HearingAuditLogResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.HearingStartDateTime, opt => opt.MapFrom(src => src.HearingStartDateTime.ToCmDateTimeString()))
            .ForMember(x => x.HearingEndDateTime, opt => opt.MapFrom(src => src.HearingEndDateTime.ToCmDateTimeString()))
            .ForMember(x => x.FileNumber, opt => opt.MapFrom(src => src.Dispute.FileNumber));
    }
}