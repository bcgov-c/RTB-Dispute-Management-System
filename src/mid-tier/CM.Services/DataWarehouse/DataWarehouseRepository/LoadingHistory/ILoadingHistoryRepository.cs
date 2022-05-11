using System.Threading.Tasks;
using CM.Services.DataWarehouse.DataWarehouseRepository.Base;

namespace CM.Services.DataWarehouse.DataWarehouseRepository.LoadingHistory;

public interface ILoadingHistoryRepository : IDwRepository<CM.Services.DataWarehouse.DataWarehouseDataModel.Models.LoadingHistory>
{
    Task<System.DateTime?> GetLastLoadStartDateTime();
}