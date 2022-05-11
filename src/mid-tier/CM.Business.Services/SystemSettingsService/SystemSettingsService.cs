using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Setting;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.SystemSettingsService;

public class SystemSettingsService : CmServiceBase, ISystemSettingsService
{
    public SystemSettingsService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<T> GetValueAsync<T>(string key)
    {
        var setting = await UnitOfWork.SystemSettingsRepository.GetSetting(key);
        return (T)Convert.ChangeType(setting.Value, typeof(T));
    }

    public async Task<List<SettingResponse>> GetSettingsAsync()
    {
        var settings = await UnitOfWork.SystemSettingsRepository.GetAllAsync();
        return MapperService.Map<List<SettingResponse>>(settings.OrderBy(s => s.SystemSettingsId));
    }

    public Task<string> Encrypt(string value, string salt)
    {
        var result = HashHelper.EncryptPassword(value, salt);
        return System.Threading.Tasks.Task.FromResult(result);
    }

    public async Task<bool> UpdateSettingValue(string key, string value)
    {
        var setting = await UnitOfWork.SystemSettingsRepository.GetSetting(key);
        setting.Value = value;

        var result = await UnitOfWork.Complete();

        return result.CheckSuccess();
    }
}