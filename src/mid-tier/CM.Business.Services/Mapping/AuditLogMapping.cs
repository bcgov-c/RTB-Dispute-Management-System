using AutoMapper;
using CM.Business.Entities.Models.AuditLog;
using CM.Common.Utilities;
using CM.Data.Model;

namespace CM.Business.Services.Mapping;

public class AuditLogMapping : Profile
{
    public AuditLogMapping()
    {
        CreateMap<AuditLog, AuditLogListResponse>()
            .ForMember(x => x.ChangeDate, opt => opt.MapFrom(src => src.ChangeDate.ToCmDateTimeString()));
        CreateMap<AuditLog, AuditLogItemResponse>()
            .ForMember(x => x.ChangeDate, opt => opt.MapFrom(src => src.ChangeDate.ToCmDateTimeString()))
            .ForMember(x => x.ApiCallData, opt => opt.MapFrom(src => src.ApiCallData.Base64Decode()));

        CreateMap<AuditLogRequest, AuditLog>()
            .ForMember(x => x.ApiCallData, opt => opt.MapFrom(src => src.ApiCallData.Base64Encode()));

        CreateMap<AuditLog, AuditLogRequest>()
            .ForMember(x => x.ApiCallData, opt => opt.MapFrom(src => src.ApiCallData.Base64Decode()));
    }
}