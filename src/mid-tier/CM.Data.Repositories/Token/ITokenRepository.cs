using System.Collections.Generic;
using System.Threading.Tasks;
using CM.Data.Model;
using CM.Data.Repositories.Base;

namespace CM.Data.Repositories.Token;

public interface ITokenRepository : IRepository<UserToken>
{
    Task<List<UserToken>> GetRecentRecords(int userId, int topRecentRecordsCount);

    Task<UserToken> GetTokenAsync(string authToken);

    Task<UserToken> GetTokenWithDetailsAsync(string authToken);

    Task<List<UserToken>> GetUserTokens(int userId);
}