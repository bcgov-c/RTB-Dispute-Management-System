using AutoMapper;
using CM.Business.Entities.Models.InternalUserRole;
using CM.Business.Entities.Models.User;
using CM.Common.Utilities;
using CM.Data.Model;

namespace CM.Business.Services.Mapping;

public class UserMapping : Profile
{
    public UserMapping()
    {
        CreateMap<SystemUser, UserResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));

        CreateMap<SystemUser, PatchUserRequest>();

        // Resource to domain
        CreateMap<PatchUserRequest, SystemUser>();

        CreateMap<UserLoginRequest, SystemUser>();
        CreateMap<SystemUser, UserLoginResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));

        CreateMap<UserLoginPatchRequest, SystemUser>();
        CreateMap<SystemUser, UserLoginPatchRequest>();
        CreateMap<UserLoginResetRequest, SystemUser>();
        CreateMap<SystemUser, UserLoginResetRequest>();

        CreateMap<Data.Model.InternalUserRole, InternalUserRoleResponse>()
            .ForMember(x => x.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate.ToCmDateTimeString()))
            .ForMember(x => x.ModifiedDate, opt => opt.MapFrom(src => src.ModifiedDate.ToCmDateTimeString()));

        CreateMap<UserToken, RecentLoginsResponse>()
            .ForMember(x => x.IssuedOn, opt => opt.MapFrom(src => src.IssuedOn.ToCmDateTimeString()));
    }
}