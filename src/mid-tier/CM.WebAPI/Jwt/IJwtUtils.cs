using System;
using System.Threading.Tasks;

namespace CM.WebAPI.Jwt;

public interface IJwtUtils
{
    public Task<string> GenerateToken(Guid sessionGuid);

    public Guid? ValidateToken(string token);

    public string GenerateRefreshToken();

    public Guid? GetPrincipalFromExpiredToken(string token);
}