using System.Threading.Tasks;

namespace CM.Business.Services.EmailMessages;

public interface ISendPreferredDateEmailsService
{
    Task<bool> Handle();
}