using AutoMapper;
using CM.Business.Entities.Models.CustomConfigObject;
using CM.Business.Entities.Models.CustomDataObject;
using CM.Common.Utilities;

namespace CM.Business.Services.Mapping;

public class CustomConfigObjectMapping : Profile
{
    public CustomConfigObjectMapping()
    {
        CreateMap<CustomConfigObjectPostRequest, Data.Model.CustomConfigObject>();
        CreateMap<Data.Model.CustomConfigObject, CustomConfigObjectResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));
        CreateMap<Data.Model.CustomConfigObject, CustomObjectPatchRequest>();
        CreateMap<CustomConfigObjectPatchRequest, Data.Model.CustomConfigObject>();
        CreateMap<CustomConfigObjectResponse, CustomConfigObjectPatchRequest>();
    }
}