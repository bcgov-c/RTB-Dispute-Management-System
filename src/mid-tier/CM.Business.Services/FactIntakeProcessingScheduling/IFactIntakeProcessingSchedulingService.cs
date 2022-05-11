using System.Threading.Tasks;

namespace CM.Business.Services.FactIntakeProcessingScheduling;

public interface IFactIntakeProcessingSchedulingService
{
    Task<bool> ProcessFactIntakeProcessing();
}