using CM.Data.Model;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.Maintenance;

public class MaintenanceRepository : CmRepository<Model.Maintenance>, IMaintenanceRepository
{
    public MaintenanceRepository(CaseManagementContext context)
        : base(context)
    {
    }
}