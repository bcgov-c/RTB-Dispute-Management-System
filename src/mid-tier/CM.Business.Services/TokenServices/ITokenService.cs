using System.Threading.Tasks;
using CM.Business.Entities.Models.User;
using CM.Data.Model;

namespace CM.Business.Services.TokenServices;

public interface ITokenService
{
    Task<UserToken> GenerateToken(int sessionDuration, int? userId, int? participantId = null);

    Task<bool> ValidateAndRefreshToken(string authToken, bool extendSession = true);

    Task<bool> KillToken(string authToken);

    Task<int> GetUserId(string authToken);

    Task<UserToken> GetUserToken(string authToken);

    Task<UserToken> GetUserTokenWithDetails(string authToken);

    Task<SessionResponse> GetSessionDuration(string authToken);

    Task<SessionResponse> ExtendSession(string authToken);
}