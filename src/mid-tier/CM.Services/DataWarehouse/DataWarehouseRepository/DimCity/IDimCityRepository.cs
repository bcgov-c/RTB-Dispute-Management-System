using System.Threading.Tasks;
using CM.Data.Model;
using CM.Services.DataWarehouse.DataWarehouseRepository.Base;

namespace CM.Services.DataWarehouse.DataWarehouseRepository.DimCity;

public interface IDimCityRepository : IDwRepository<CM.Services.DataWarehouse.DataWarehouseDataModel.Models.DimCity>
{
    Task<int> GetCityId(Dispute dispute);
}