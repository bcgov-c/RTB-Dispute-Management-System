using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using CM.Common.Utilities;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace CM.WebAPI.Jwt;

public class JwtUtils : IJwtUtils
{
    private readonly JwtSettings _appSettings;

    public JwtUtils(IOptions<JwtSettings> appSettings)
    {
        _appSettings = appSettings.Value;
    }

    public Task<string> GenerateToken(Guid sessionGuid)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_appSettings.Key);
        var expireRange = _appSettings.ExpireRange;
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[] { new Claim("id", sessionGuid.ToString()) }),
            Expires = DateTime.UtcNow.AddMinutes(expireRange),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return Task.FromResult(tokenHandler.WriteToken(token));
    }

    public Guid? ValidateToken(string token)
    {
        if (token == null)
        {
            return null;
        }

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_appSettings.Key);

        try
        {
            var tokenValidation = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = false,
                ValidateAudience = false,
                ClockSkew = TimeSpan.Zero
            };

            tokenHandler.ValidateToken(token, tokenValidation, out var validatedToken);
            var jwtToken = (JwtSecurityToken)validatedToken;
            var sessionGuid = Guid.Parse(jwtToken.Claims.First(x => x.Type == "id").Value);

            return sessionGuid;
        }
        catch
        {
            return null;
        }
    }

    public string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using var rng = RandomNumberGenerator.Create();

        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    public Guid? GetPrincipalFromExpiredToken(string token)
    {
        var key = Encoding.ASCII.GetBytes(_appSettings.Key);
        var refreshRange = _appSettings.RefreshRange;

        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = false,
            ValidateIssuer = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateLifetime = false
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        tokenHandler.ValidateToken(token, tokenValidationParameters, out var securityToken);
        var jwtSecurityToken = securityToken as JwtSecurityToken;

        if (jwtSecurityToken != null && jwtSecurityToken.ValidTo > DateTime.UtcNow.AddMinutes(refreshRange))
        {
            throw new SecurityTokenException(ApiReturnMessages.RefreshTokenExpired);
        }

        if (jwtSecurityToken == null || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256,
                StringComparison.InvariantCultureIgnoreCase))
        {
            throw new SecurityTokenException(ApiReturnMessages.InvalidSessionTokenForRotation);
        }

        var sessionGuid = Guid.Parse(jwtSecurityToken.Claims.First(x => x.Type == "id").Value);

        return sessionGuid;
    }
}