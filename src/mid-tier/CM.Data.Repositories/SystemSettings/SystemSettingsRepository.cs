using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.SystemSettings;

public class SystemSettingsRepository : CmRepository<Model.SystemSettings>, ISystemSettingsRepository
{
    public SystemSettingsRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<Model.SystemSettings> GetSetting(string key)
    {
        var setting = await Context.SystemSettings.SingleOrDefaultAsync(s => s.Key == key);
        return setting;
    }
}