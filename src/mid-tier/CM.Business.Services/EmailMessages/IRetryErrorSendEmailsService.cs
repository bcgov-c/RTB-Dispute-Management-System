using System.Threading.Tasks;

namespace CM.Business.Services.EmailMessages;

public interface IRetryErrorSendEmailsService
{
    Task<bool> Handle();
}