using AutoMapper;
using CM.Business.Entities.Models.ConferenceBridge;
using CM.Common.Utilities;

namespace CM.Business.Services.Mapping;

public class ConferenceBridgeMapping : Profile
{
    public ConferenceBridgeMapping()
    {
        CreateMap<ConferenceBridgeRequest, Data.Model.ConferenceBridge>();
        CreateMap<Data.Model.ConferenceBridge, ConferenceBridgeRequest>();

        CreateMap<Data.Model.ConferenceBridge, ConferenceBridgeResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.PreferredStartTime, opt => opt.MapFrom(src => src.PreferredStartTime.ToCmDateTimeString()))
            .ForMember(x => x.PreferredEndTime, opt => opt.MapFrom(src => src.PreferredEndTime.ToCmDateTimeString()));
    }
}