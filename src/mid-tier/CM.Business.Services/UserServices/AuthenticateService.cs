using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Services.TokenServices;
using CM.Common.Utilities;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.UserServices;

public class AuthenticateService : CmServiceBase, IAuthenticateService
{
    public AuthenticateService(IMapper mapper, IUnitOfWork unitOfWork, ITokenService tokenService)
        : base(unitOfWork, mapper)
    {
        TokenService = tokenService;
    }

    private ITokenService TokenService { get; }

    public async Task<string> Login(string username, string password)
    {
        const int sessionDuration = 900;
        var user = UnitOfWork.SystemUserRepository.GetUser(username, HashHelper.GetHash(password));

        if (user != null)
        {
            var token = await TokenService.GenerateToken(sessionDuration, user.SystemUserId);
            return token.AuthToken;
        }

        return null;
    }
}