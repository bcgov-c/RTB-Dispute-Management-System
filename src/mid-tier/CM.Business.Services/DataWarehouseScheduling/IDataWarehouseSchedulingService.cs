using System.Threading.Tasks;

namespace CM.Business.Services.DataWarehouseScheduling;

public interface IDataWarehouseSchedulingService
{
    Task<bool> ProcessFactDispute();
}