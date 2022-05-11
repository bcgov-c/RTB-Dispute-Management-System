using AutoMapper;
using CM.Business.Entities.Models.CustomDataObject;
using CM.Common.Utilities;

namespace CM.Business.Services.Mapping;

public class CustomDataObjectMapping : Profile
{
    public CustomDataObjectMapping()
    {
        CreateMap<CustomDataObjectRequest, Data.Model.CustomDataObject>();
        CreateMap<Data.Model.CustomDataObject, CustomDataObjectResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));
        CreateMap<Data.Model.CustomDataObject, CustomObjectPatchRequest>();
        CreateMap<CustomObjectPatchRequest, Data.Model.CustomDataObject>();
    }
}