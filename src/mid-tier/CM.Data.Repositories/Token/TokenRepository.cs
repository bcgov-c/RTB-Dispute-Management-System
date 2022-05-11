using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;
using Microsoft.EntityFrameworkCore;

namespace CM.Data.Repositories.Token;

public class TokenRepository : CmRepository<UserToken>, ITokenRepository
{
    public TokenRepository(CaseManagementContext context)
        : base(context)
    {
    }

    public async Task<UserToken> GetTokenAsync(string authToken)
    {
        var token = await Context.UserTokens.SingleOrDefaultAsync(t => t.AuthToken == authToken && t.ExpiresOn > DateTime.Now);
        return token;
    }

    public async Task<UserToken> GetTokenWithDetailsAsync(string authToken)
    {
        var token = await Context.UserTokens.Include(x => x.SystemUser.DisputeUsers).SingleOrDefaultAsync(t => t.AuthToken == authToken && t.ExpiresOn > DateTime.Now);
        return token;
    }

    public async Task<List<UserToken>> GetUserTokens(int userId)
    {
        var tokens = await Context.UserTokens
            .Where(t => t.SystemUserId == userId && t.ExpiresOn >= DateTime.Now)
            .ToListAsync();

        return tokens;
    }

    public UserToken GetToken(string authToken)
    {
        var token = Context.UserTokens.SingleOrDefault(t => t.AuthToken == authToken && t.ExpiresOn > DateTime.Now);
        return token;
    }
}