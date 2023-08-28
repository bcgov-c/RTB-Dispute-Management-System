using AutoMapper;
using CM.Business.Entities.Models.ExternalErrorLog;
using CM.Common.Utilities;

namespace CM.Business.Services.Mapping
{
    public class ExternalErrorLogMapping : Profile
    {
        public ExternalErrorLogMapping()
        {
            CreateMap<ExternalErrorLogRequest, Data.Model.ExternalErrorLog>();
            CreateMap<Data.Model.ExternalErrorLog, ExternalErrorLogResponse>()
            .ForMember(x => x.ReportedDate, opt => opt.MapFrom(src => src.ReportedDate.ToCmDateTimeString()))
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));

            CreateMap<Data.Model.ExternalErrorLog, ExternalErrorLogPatchRequest>();
            CreateMap<ExternalErrorLogPatchRequest, Data.Model.ExternalErrorLog>();
        }
    }
}
