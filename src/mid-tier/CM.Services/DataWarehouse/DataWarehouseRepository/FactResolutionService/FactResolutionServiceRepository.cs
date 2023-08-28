using CM.Services.DataWarehouse.DataWarehouseDataModel;
using CM.Services.DataWarehouse.DataWarehouseRepository.Base;
using DWDM = CM.Services.DataWarehouse.DataWarehouseDataModel.Models;

namespace CM.Services.DataWarehouse.DataWarehouseRepository.FactResolutionService
{
    public class FactResolutionServiceRepository : DwRepository<DWDM.FactResolutionService>, IFactResolutionServiceRepository
    {
        public FactResolutionServiceRepository(DataWarehouseContext context)
        : base(context)
        {
        }
    }
}
