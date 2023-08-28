using System.Threading.Tasks;

namespace CM.Business.Services.FactResolutionServiceScheduling
{
    public interface IFactResolutionServiceSchedulingService
    {
        Task<bool> ProcessFactResolutionService();
    }
}
