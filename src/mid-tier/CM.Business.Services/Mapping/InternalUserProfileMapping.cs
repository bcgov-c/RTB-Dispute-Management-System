using AutoMapper;
using CM.Business.Entities.Models.InternalUserProfile;
using CM.Common.Utilities;

namespace CM.Business.Services.Mapping;

public class InternalUserProfileMapping : Profile
{
    public InternalUserProfileMapping()
    {
        CreateMap<Data.Model.InternalUserProfile, InternalUserProfileResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));

        CreateMap<Data.Model.InternalUserProfile, InternalUserProfileRequest>();
        CreateMap<InternalUserProfileRequest, Data.Model.InternalUserProfile>();
    }
}