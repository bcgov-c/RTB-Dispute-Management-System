using System.Threading.Tasks;

namespace CM.Business.Services.FactTimeStatisticScheduling;

public interface IFactTimeStatisticSchedulingService
{
    Task<bool> ProcessFactTimeStatistic();
}