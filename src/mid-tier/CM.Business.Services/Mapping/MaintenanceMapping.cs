using AutoMapper;
using CM.Business.Entities.Models.Maintenance;
using CM.Common.Utilities;

namespace CM.Business.Services.Mapping;

public class MaintenanceMapping : Profile
{
    public MaintenanceMapping()
    {
        CreateMap<Data.Model.Maintenance, MaintenanceResponse>()
            .ForMember(x => x.StartDateTime, opt => opt.MapFrom(src => src.StartDateTime.ToCmDateTimeString()));
    }
}