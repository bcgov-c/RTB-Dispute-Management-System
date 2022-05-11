using System;
using System.Threading.Tasks;
using CM.Services.DataWarehouse.DataWarehouseRepository.Base;

namespace CM.Services.DataWarehouse.DataWarehouseRepository.DimTime;

public interface IDimTimeRepository : IDwRepository<CM.Services.DataWarehouse.DataWarehouseDataModel.Models.DimTime>
{
    Task<int> GetIdByDate(DateTime date);
}