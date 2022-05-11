using AutoMapper;
using CM.Business.Entities.Models.Setting;
using CM.Data.Model;

namespace CM.Business.Services.Mapping;

public class SettingMapping : Profile
{
    public SettingMapping()
    {
        CreateMap<SettingResponse, SystemSettings>();
        CreateMap<SystemSettings, SettingResponse>();
    }
}