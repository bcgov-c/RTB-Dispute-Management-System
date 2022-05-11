using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.Maintenance;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.Maintenance;

public class MaintenanceService : CmServiceBase, IMaintenanceService
{
    public MaintenanceService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<MaintenanceFullResponse> GetAll()
    {
        var activeMaintenanceList = await UnitOfWork.MaintenanceRepository.FindAllAsync(m => m.Active);
        var maintenanceResponse = new MaintenanceFullResponse
        {
            TotalAvailableRecords = activeMaintenanceList.Count,
            Maintenances = MapperService.Map<List<Data.Model.Maintenance>, List<MaintenanceResponse>>(activeMaintenanceList.ToList())
        };

        return maintenanceResponse;
    }
}