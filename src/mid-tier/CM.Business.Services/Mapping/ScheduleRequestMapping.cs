using AutoMapper;
using CM.Business.Entities.Models.ScheduleRequest;
using CM.Common.Utilities;

namespace CM.Business.Services.Mapping;

public class ScheduleRequestMapping : Profile
{
    public ScheduleRequestMapping()
    {
        CreateMap<ScheduleRequestPostRequest, Data.Model.ScheduleRequest>();
        CreateMap<Data.Model.ScheduleRequest, ScheduleRequestPostResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.RequestStart, opt => opt.MapFrom(src => src.RequestStart.ToCmDateTimeString()))
            .ForMember(x => x.RequestEnd, opt => opt.MapFrom(src => src.RequestEnd.ToCmDateTimeString()));

        CreateMap<ScheduleRequestPatchRequest, Data.Model.ScheduleRequest>();
        CreateMap<Data.Model.ScheduleRequest, ScheduleRequestPatchRequest>();
        CreateMap<Data.Model.ScheduleRequest, ScheduleRequestPatchResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.RequestStart, opt => opt.MapFrom(src => src.RequestStart.ToCmDateTimeString()))
            .ForMember(x => x.RequestEnd, opt => opt.MapFrom(src => src.RequestEnd.ToCmDateTimeString()));

        CreateMap<Data.Model.ScheduleRequest, ScheduleRequestGetResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.RequestStart, opt => opt.MapFrom(src => src.RequestStart.ToCmDateTimeString()))
            .ForMember(x => x.RequestEnd, opt => opt.MapFrom(src => src.RequestEnd.ToCmDateTimeString()));
    }
}