using System;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CM.Business.Entities.Models.User;
using CM.Common.Utilities;
using CM.Data.Model;
using CM.Data.Repositories.UnitOfWork;

namespace CM.Business.Services.TokenServices;

public class TokenService : CmServiceBase, ITokenService
{
    public TokenService(IMapper mapper, IUnitOfWork unitOfWork)
        : base(unitOfWork, mapper)
    {
    }

    public async Task<UserToken> GenerateToken(int sessionDuration, int? userId, int? participantId = null)
    {
        var systemUser = userId.HasValue ? await UnitOfWork.SystemUserRepository.GetByIdAsync(userId.Value) : null;

        if (systemUser is { SystemUserRoleId: (int)Roles.ExternalUser })
        {
            var userTokens = await UnitOfWork.TokenRepository.GetUserTokens(systemUser.SystemUserId);
            if (userTokens != null && userTokens.Any())
            {
                foreach (var userToken in userTokens)
                {
                    await KillToken(userToken.AuthToken);
                }
            }
        }

        var token = new UserToken
        {
            AuthToken = Guid.NewGuid().ToString(),
            IssuedOn = DateTime.Now,
            ExpiresOn = DateTime.Now.AddSeconds(sessionDuration),
            SystemUserId = userId,
            SystemUserGuid = systemUser?.UserGuid,
            ParticipantId = participantId
        };

        await UnitOfWork.TokenRepository.InsertAsync(token);
        await UnitOfWork.Complete();

        return token;
    }

    public async Task<bool> ValidateAndRefreshToken(string authToken, bool extendSession = true)
    {
        var token = await UnitOfWork.TokenRepository.GetTokenAsync(authToken);
        if (token != null)
        {
            if (extendSession)
            {
                SystemUser user;

                if (token.SystemUserId != null)
                {
                    user = await UnitOfWork.SystemUserRepository.GetByIdAsync(token.SystemUserId.Value);
                }
                else
                {
                    var participant = token.ParticipantId != null ? await UnitOfWork.ParticipantRepository.GetWithUser(token.ParticipantId.Value) : null;
                    user = participant?.SystemUser;
                }

                if (user != null)
                {
                    var role = await UnitOfWork.RoleRepository.GetByIdAsync(user.SystemUserRoleId);
                    token.ExpiresOn = DateTime.Now.AddSeconds(role.SessionDuration);
                    UnitOfWork.TokenRepository.Update(token);
                    var completeResult = await UnitOfWork.Complete();
                    completeResult.AssertSuccess();

                    return true;
                }
            }
        }

        return false;
    }

    public async Task<bool> KillToken(string authToken)
    {
        var token = await UnitOfWork.TokenRepository.GetTokenAsync(authToken);
        if (token != null)
        {
            token.ExpiresOn = DateTime.Now;
            UnitOfWork.TokenRepository.Update(token);
            var completeResult = await UnitOfWork.Complete();
            completeResult.AssertSuccess();

            return true;
        }

        return false;
    }

    public async Task<int> GetUserId(string authToken)
    {
        var token = await UnitOfWork.TokenRepository.GetTokenAsync(authToken);
        if (token?.SystemUserId != null)
        {
            var user = await UnitOfWork.SystemUserRepository.GetNoTrackingByIdAsync(x => x.SystemUserId == token.SystemUserId.Value);
            return user.SystemUserId;
        }

        return 0;
    }

    public async Task<UserToken> GetUserToken(string authToken)
    {
        var token = await UnitOfWork.TokenRepository.GetTokenAsync(authToken);

        return token;
    }

    public async Task<UserToken> GetUserTokenWithDetails(string authToken)
    {
        var token = await UnitOfWork.TokenRepository.GetTokenWithDetailsAsync(authToken);

        return token;
    }

    public async Task<SessionResponse> GetSessionDuration(string authToken)
    {
        var token = await UnitOfWork.TokenRepository.GetTokenAsync(authToken);
        if (token != null)
        {
            var sessionTimeRemaining = (int)token.ExpiresOn.Subtract(DateTime.Now).TotalSeconds;
            return new SessionResponse { SessionTimeRemaining = sessionTimeRemaining };
        }

        return null;
    }

    public async Task<SessionResponse> ExtendSession(string authToken)
    {
        var sessionTimeout = 0;
        var token = await UnitOfWork.TokenRepository.GetTokenAsync(authToken);
        if (token != null)
        {
            if (token.SystemUserId != null)
            {
                var user = await UnitOfWork.SystemUserRepository.GetUserWithFullInfo((int)token.SystemUserId);
                if (user != null)
                {
                    sessionTimeout = await UnitOfWork.RoleRepository.GetSessionDuration(user.SystemUserRoleId);
                }
            }

            token.ExpiresOn = DateTime.Now.AddSeconds(sessionTimeout);
            UnitOfWork.TokenRepository.Attach(token);
            var result = await UnitOfWork.Complete();
            if (result.CheckSuccess())
            {
                return new SessionResponse { SessionTimeRemaining = sessionTimeout };
            }
        }

        return null;
    }
}