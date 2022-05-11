using System.Threading.Tasks;
using CM.Business.Entities.Models.Maintenance;

namespace CM.Business.Services.Maintenance;

public interface IMaintenanceService
{
    Task<MaintenanceFullResponse> GetAll();
}