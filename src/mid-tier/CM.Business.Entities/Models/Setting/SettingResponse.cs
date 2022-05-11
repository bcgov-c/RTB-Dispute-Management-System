using Newtonsoft.Json;

namespace CM.Business.Entities.Models.Setting;

public class SettingResponse
{
    [JsonProperty("system_settings_id")]
    public string SystemSettingsId { get; set; }

    [JsonProperty("key")]
    public string Key { get; set; }

    [JsonProperty("value")]
    public string Value { get; set; }
}