using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Business.Entities.Models.Setting;

namespace CM.Business.Services.SystemSettingsService;

public interface ISystemSettingsService
{
    Task<T> GetValueAsync<T>(string key);

    Task<bool> UpdateSettingValue(string key, string value);

    Task<List<SettingResponse>> GetSettingsAsync();

    Task<string> Encrypt(string value, string salt);
}