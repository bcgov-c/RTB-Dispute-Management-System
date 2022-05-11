using AutoMapper;
using CM.Business.Entities.Models.InternalUserRole;

namespace CM.Business.Services.Mapping;

public class InternalUserRoleMapping : Profile
{
    public InternalUserRoleMapping()
    {
        CreateMap<InternalUserRoleRequest, Data.Model.InternalUserRole>();
        CreateMap<Data.Model.InternalUserRole, InternalUserRoleResponse>();
        CreateMap<Data.Model.InternalUserRole, InternalUserRoleRequest>();
    }
}