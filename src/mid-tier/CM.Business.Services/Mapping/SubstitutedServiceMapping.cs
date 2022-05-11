using AutoMapper;
using CM.Business.Entities.Models.SubstitutedService;
using CM.Common.Utilities;

namespace CM.Business.Services.Mapping;

public class SubstitutedServiceMapping : Profile
{
    public SubstitutedServiceMapping()
    {
        CreateMap<Data.Model.SubstitutedService, SubstitutedServicePatchRequest>();

        CreateMap<SubstitutedServicePatchRequest, Data.Model.SubstitutedService>();

        CreateMap<Data.Model.SubstitutedService, SubstitutedServicePostResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()))
            .ForMember(x => x.FailedMethod1Date, opt => opt.MapFrom(src => src.FailedMethod1Date.ToCmDateTimeString()))
            .ForMember(x => x.FailedMethod2Date, opt => opt.MapFrom(src => src.FailedMethod2Date.ToCmDateTimeString()))
            .ForMember(x => x.FailedMethod3Date, opt => opt.MapFrom(src => src.FailedMethod3Date.ToCmDateTimeString()))
            .ForMember(x => x.RequestingTimeExtensionDate, opt => opt.MapFrom(src => src.RequestingTimeExtensionDate.ToCmDateTimeString()))
            .ForMember(x => x.SubServiceEffectiveDate, opt => opt.MapFrom(src => src.SubServiceEffectiveDate.ToCmDateTimeString()))
            .ForMember(x => x.SubServiceExpiryDate, opt => opt.MapFrom(src => src.SubServiceExpiryDate.ToCmDateTimeString()));

        CreateMap<SubstitutedServicePostRequest, Data.Model.SubstitutedService>();
    }
}