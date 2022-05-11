using System.Threading.Tasks;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.SystemSettings;

public interface ISystemSettingsRepository : IRepository<Model.SystemSettings>
{
    Task<Model.SystemSettings> GetSetting(string key);
}