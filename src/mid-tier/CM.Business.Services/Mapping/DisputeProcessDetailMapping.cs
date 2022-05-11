using AutoMapper;
using CM.Business.Entities.Models.DisputeProcessDetail;
using CM.Common.Utilities;

namespace CM.Business.Services.Mapping;

public class DisputeProcessDetailMapping : Profile
{
    public DisputeProcessDetailMapping()
    {
        CreateMap<DisputeProcessDetailPostRequest, Data.Model.DisputeProcessDetail>();
        CreateMap<DisputeProcessDetailPatchRequest, Data.Model.DisputeProcessDetail>();
        CreateMap<Data.Model.DisputeProcessDetail, DisputeProcessDetailPatchRequest>();

        CreateMap<Data.Model.DisputeProcessDetail, DisputeProcessDetailResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));
    }
}