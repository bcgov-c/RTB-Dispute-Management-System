using System.Threading.Tasks;

namespace CM.Business.Services.FactHearingSummaryScheduling;

public interface IFactHearingSummarySchedulingService
{
    Task<bool> ProcessFactHearingSummary();
}