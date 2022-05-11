using AutoMapper;
using CM.Business.Entities.Models.SchedulePeriod;
using CM.Common.Utilities;

namespace CM.Business.Services.Mapping;

public class SchedulePeriodMapping : Profile
{
    public SchedulePeriodMapping()
    {
        CreateMap<Data.Model.SchedulePeriod, SchedulePeriodPostResponse>()
            .ForMember(x => x.PeriodStart, opt => opt.MapFrom(src => src.PeriodStart.ToCmDateTimeString()))
            .ForMember(x => x.PeriodEnd, opt => opt.MapFrom(src => src.PeriodEnd.ToCmDateTimeString()))
            .ForMember(x => x.LocalPeriodStart, opt => opt.MapFrom(src => src.LocalPeriodStart.ToCmDateTimeString()))
            .ForMember(x => x.LocalPeriodEnd, opt => opt.MapFrom(src => src.LocalPeriodEnd.ToCmDateTimeString()))
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));

        CreateMap<Data.Model.SchedulePeriod, SchedulePeriodPatchRequest>();
        CreateMap<SchedulePeriodPatchRequest, Data.Model.SchedulePeriod>();

        CreateMap<Data.Model.SchedulePeriod, SchedulePeriodGetResponse>()
            .ForMember(x => x.PeriodStart, opt => opt.MapFrom(src => src.PeriodStart.ToCmDateTimeString()))
            .ForMember(x => x.PeriodEnd, opt => opt.MapFrom(src => src.PeriodEnd.ToCmDateTimeString()))
            .ForMember(x => x.LocalPeriodStart, opt => opt.MapFrom(src => src.LocalPeriodStart.ToCmDateTimeString()))
            .ForMember(x => x.LocalPeriodEnd, opt => opt.MapFrom(src => src.LocalPeriodEnd.ToCmDateTimeString()))
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));
    }
}