using CM.Services.DataWarehouse.DataWarehouseDataModel;
using CM.Services.DataWarehouse.DataWarehouseRepository.Base;
using DWDM = CM.Services.DataWarehouse.DataWarehouseDataModel.Models;

namespace CM.Services.DataWarehouse.DataWarehouseRepository.FactTimeStatistic;

public class FactTimeStatisticRepository : DwRepository<DWDM.FactTimeStatistic>, IFactTimeStatisticRepository
{
    public FactTimeStatisticRepository(DataWarehouseContext context)
        : base(context)
    {
    }
}