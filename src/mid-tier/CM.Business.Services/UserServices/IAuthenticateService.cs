using System.Threading.Tasks;

namespace CM.Business.Services.UserServices;

public interface IAuthenticateService
{
    Task<string> Login(string username, string password);
}