using AutoMapper;
using CM.Business.Entities.Models.ServiceAuditLog;
using CM.Common.Utilities;

namespace CM.Business.Services.Mapping
{
    public class ServiceAuditLogMapping : Profile
    {
        public ServiceAuditLogMapping()
        {
            CreateMap<Data.Model.ServiceAuditLog, ServiceAuditLogResponse>()
                .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
                .ForMember(x => x.ServiceDate, opt => opt.MapFrom(src => src.ServiceDate.ToCmDateTimeString()))
                .ForMember(x => x.ReceivedDate, opt => opt.MapFrom(src => src.ReceivedDate.ToCmDateTimeString()));
        }
    }
}
