using AutoMapper;
using CM.Business.Entities.Models.ExternalCustomDataObject;
using CM.Common.Utilities;

namespace CM.Business.Services.Mapping;

public class ExternalCustomDataObjectMapping : Profile
{
    public ExternalCustomDataObjectMapping()
    {
        CreateMap<ExternalCustomDataObjectRequest, Data.Model.ExternalCustomDataObject>();
        CreateMap<Data.Model.ExternalCustomDataObject, ExternalCustomDataObjectResponse>()
            .ForMember(x => x.Expiry, opt => opt.MapFrom(src => src.Expiry.ToCmDateTimeString()))
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));
        CreateMap<Data.Model.ExternalCustomDataObject, ExternalCustomObjectPatchRequest>();
        CreateMap<ExternalCustomObjectPatchRequest, Data.Model.ExternalCustomDataObject>();
    }
}