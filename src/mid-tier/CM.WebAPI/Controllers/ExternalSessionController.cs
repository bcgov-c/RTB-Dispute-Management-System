using System;
using System.Text;
using System.Threading.Tasks;
using CM.Business.Services.SystemSettingsService;
using CM.Common.Utilities;
using CM.WebAPI.Jwt;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace CM.WebAPI.Controllers;

[ApiExplorerSettings(IgnoreApi = true)]
public class ExternalSessionController : Controller
{
    private readonly IJwtUtils _jwtUtils;
    private readonly ISystemSettingsService _systemSettingsService;

    public ExternalSessionController(ISystemSettingsService systemSettingsService, IOptions<JwtSettings> appSettings)
    {
        _systemSettingsService = systemSettingsService;
        _jwtUtils = new JwtUtils(appSettings);
        InitializeSettings();
    }

    private string ExternalIntakeUiUrl { get; set; }

    [Route("ceuintake/login")]
    public async Task<IActionResult> Login()
    {
        var sessionGuid = Guid.NewGuid();
        var token = await _jwtUtils.GenerateToken(sessionGuid);
        var newRefreshToken = _jwtUtils.GenerateRefreshToken();

        var redirectUrl = new StringBuilder();
        redirectUrl.Append(ExternalIntakeUiUrl);
        redirectUrl.Append("/?token=");
        redirectUrl.Append(token);
        redirectUrl.Append("&refresh-token=");
        redirectUrl.Append(newRefreshToken);
        return Redirect(redirectUrl.ToString());
    }

    private void InitializeSettings()
    {
        ExternalIntakeUiUrl = _systemSettingsService.GetValueAsync<string>(SettingKeys.ExternalIntakeUiUrl).Result;
    }
}