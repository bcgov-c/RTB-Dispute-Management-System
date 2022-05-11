using AutoMapper;
using CM.Business.Entities.Models.HearingReporting;
using CM.Business.Entities.Models.ScheduleBlock;
using CM.Common.Utilities;

namespace CM.Business.Services.Mapping;

public class ScheduleBlockMapping : Profile
{
    public ScheduleBlockMapping()
    {
        CreateMap<ScheduleBlockPostRequest, Data.Model.ScheduleBlock>();
        CreateMap<Data.Model.ScheduleBlock, ScheduleBlockPostResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.BlockStart, opt => opt.MapFrom(src => src.BlockStart.ToCmDateTimeString()))
            .ForMember(x => x.BlockEnd, opt => opt.MapFrom(src => src.BlockEnd.ToCmDateTimeString()));

        CreateMap<ScheduleBlockPatchRequest, Data.Model.ScheduleBlock>();
        CreateMap<Data.Model.ScheduleBlock, ScheduleBlockPatchRequest>();
        CreateMap<Data.Model.ScheduleBlock, ScheduleBlockPatchResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.BlockStart, opt => opt.MapFrom(src => src.BlockStart.ToCmDateTimeString()))
            .ForMember(x => x.BlockEnd, opt => opt.MapFrom(src => src.BlockEnd.ToCmDateTimeString()));

        CreateMap<Data.Model.ScheduleBlock, ScheduleBlockGetResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.BlockStart, opt => opt.MapFrom(src => src.BlockStart.ToCmDateTimeString()))
            .ForMember(x => x.BlockEnd, opt => opt.MapFrom(src => src.BlockEnd.ToCmDateTimeString()));

        CreateMap<Data.Model.ScheduleBlock, ScheduleBlockResponse>()
            .ForMember(x => x.BlockStart, opt => opt.MapFrom(src => src.BlockStart.ToCmDateTimeString()))
            .ForMember(x => x.BlockEnd, opt => opt.MapFrom(src => src.BlockEnd.ToCmDateTimeString()));
    }
}