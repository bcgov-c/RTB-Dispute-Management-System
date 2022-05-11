using System.Threading.Tasks;

namespace CM.Business.Services.DisputeAbandonedForNoPayment;

public interface IDisputeAbandonedForNoPaymentService
{
    Task<bool> ProcessDisputeAbandonedForNoPayment();
}