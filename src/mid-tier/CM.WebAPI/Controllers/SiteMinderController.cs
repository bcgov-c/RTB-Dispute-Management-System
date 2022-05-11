using System;
using System.Text;
using System.Threading.Tasks;
using CM.Business.Services.SiteVersion;
using CM.Business.Services.SystemSettingsService;
using CM.Business.Services.TokenServices;
using CM.Business.Services.UserServices;
using CM.Common.Utilities;
using Microsoft.AspNetCore.Mvc;

namespace CM.WebAPI.Controllers;

[ApiExplorerSettings(IgnoreApi = true)]
public class SiteMinderController : Controller
{
    public const string SmUser = "sm_user";
    public const string SmGovUserDisplayName = "smgov_userdisplayname";
    public const string SmGovUserEmail = "smgov_useremail";
    public const string SmGovUserGuid = "smgov_userguid";
    public const int SessionDuration = 900;
    private readonly ISiteVersionService _siteVersionService;
    private readonly ISystemSettingsService _systemSettingsService;
    private readonly ITokenService _tokenService;

    private readonly IUserService _userService;

    public SiteMinderController(IUserService userService, ITokenService tokenService, ISystemSettingsService systemSettingsService, ISiteVersionService siteVersionService)
    {
        _userService = userService;
        _tokenService = tokenService;
        _systemSettingsService = systemSettingsService;
        _siteVersionService = siteVersionService;
        InitializeSettings();
    }

    public string AdminLoginUrl { get; set; }

    public string AdminSiteminderUrl { get; set; }

    public string IntakeLoginUrl { get; set; }

    public string IntakeSiteminderUrl { get; set; }

    public string AdditionalLandlordIntakeLoginUrl { get; set; }

    public string AdditionalLandlordIntakeSiteminderUrl { get; set; }

    public string OfficeLoginUrl { get; set; }

    public string OfficeSiteminderUrl { get; set; }

    public string AccessDeniedUrl { get; set; }

    [Route("admin/login")]
    public async Task<IActionResult> Admin()
    {
        var tokenMethod = await _siteVersionService.GetTokenMethod();
        if (tokenMethod == (byte)TokenMethod.InternalLogin)
        {
            var redirectUrl = new StringBuilder();
            redirectUrl.Append(AdminLoginUrl);
            return Redirect(redirectUrl.ToString());
        }

        if (!string.IsNullOrWhiteSpace(Request.Headers[SmGovUserGuid]))
        {
            var smUser = Request.Headers[SmUser];
            var smGovUserDisplayName = Request.Headers[SmGovUserDisplayName];
            var sGovUserEmail = Request.Headers[SmGovUserEmail];
            var smGovUserGuid = Guid.Parse(Request.Headers[SmGovUserGuid]);

            var user = await _userService.CreateUpdateSmUser(smUser, sGovUserEmail, smGovUserDisplayName, smGovUserGuid, (int)Roles.StaffUser);
            if (user.IsActive != null && (bool)user.IsActive)
            {
                var token = await _tokenService.GenerateToken(SessionDuration, user.SystemUserId);
                var redirectUrl = new StringBuilder();
                redirectUrl.Append(AdminSiteminderUrl);
                redirectUrl.Append("/?token=");
                redirectUrl.Append(token.AuthToken);
                return Redirect(redirectUrl.ToString());
            }
            else
            {
                var redirectUrl = new StringBuilder();
                redirectUrl.Append(AccessDeniedUrl);
                return Redirect(redirectUrl.ToString());
            }
        }

        return Ok(ApiReturnMessages.Succeeded);
    }

    [Route("intake/login")]
    public async Task<IActionResult> Intake()
    {
        var tokenMethod = await _siteVersionService.GetTokenMethod();
        if (tokenMethod == (byte)TokenMethod.InternalLogin)
        {
            var redirectUrl = new StringBuilder();
            redirectUrl.Append(IntakeLoginUrl);
            return Redirect(redirectUrl.ToString());
        }

        if (!string.IsNullOrWhiteSpace(Request.Headers[SmGovUserGuid]))
        {
            var smUser = Request.Headers[SmUser];
            var smGovUserDisplayName = Request.Headers[SmGovUserDisplayName];
            var sGovUserEmail = Request.Headers[SmGovUserEmail];
            var smGovUserGuid = Guid.Parse(Request.Headers[SmGovUserGuid]);

            var user = await _userService.CreateUpdateSmUser(smUser, sGovUserEmail, smGovUserDisplayName, smGovUserGuid, (int)Roles.ExternalUser);
            var token = await _tokenService.GenerateToken(SessionDuration, user.SystemUserId);
            var redirectUrl = new StringBuilder();
            redirectUrl.Append(IntakeSiteminderUrl);
            redirectUrl.Append("/?token=");
            redirectUrl.Append(token.AuthToken);
            return Redirect(redirectUrl.ToString());
        }

        return Ok(ApiReturnMessages.Succeeded);
    }

    [Route("additionallandlordintake/login")]
    public async Task<IActionResult> AdditionalLandlordIntake()
    {
        var tokenMethod = await _siteVersionService.GetTokenMethod();
        if (tokenMethod == (byte)TokenMethod.InternalLogin)
        {
            var redirectUrl = new StringBuilder();
            redirectUrl.Append(AdditionalLandlordIntakeLoginUrl);
            return Redirect(redirectUrl.ToString());
        }

        if (!string.IsNullOrWhiteSpace(Request.Headers[SmGovUserGuid]))
        {
            var smUser = Request.Headers[SmUser];
            var smGovUserDisplayName = Request.Headers[SmGovUserDisplayName];
            var sGovUserEmail = Request.Headers[SmGovUserEmail];
            var smGovUserGuid = Guid.Parse(Request.Headers[SmGovUserGuid]);

            var user = await _userService.CreateUpdateSmUser(smUser, sGovUserEmail, smGovUserDisplayName, smGovUserGuid, (int)Roles.ExternalUser);
            var token = await _tokenService.GenerateToken(SessionDuration, user.SystemUserId);
            var redirectUrl = new StringBuilder();
            redirectUrl.Append(AdditionalLandlordIntakeSiteminderUrl);
            redirectUrl.Append("/?token=");
            redirectUrl.Append(token.AuthToken);
            return Redirect(redirectUrl.ToString());
        }

        return Ok(ApiReturnMessages.Succeeded);
    }

    [Route("officesubmission/login")]
    public async Task<IActionResult> OfficeSubmission()
    {
        var tokenMethod = await _siteVersionService.GetTokenMethod();
        if (tokenMethod == (byte)TokenMethod.InternalLogin)
        {
            var redirectUrl = new StringBuilder();
            redirectUrl.Append(OfficeLoginUrl);
            return Redirect(redirectUrl.ToString());
        }

        if (!string.IsNullOrWhiteSpace(Request.Headers[SmGovUserGuid]))
        {
            var smUser = Request.Headers[SmUser];
            var smGovUserDisplayName = Request.Headers[SmGovUserDisplayName];
            var sGovUserEmail = Request.Headers[SmGovUserEmail];
            var smGovUserGuid = Guid.Parse(Request.Headers[SmGovUserGuid]);

            var user = await _userService.CreateUpdateSmUser(smUser, sGovUserEmail, smGovUserDisplayName, smGovUserGuid, (int)Roles.OfficePayUser);
            if (user.IsActive != null && (bool)user.IsActive && user.SystemUserRoleId is (int)Roles.StaffUser or (int)Roles.OfficePayUser)
            {
                var token = await _tokenService.GenerateToken(SessionDuration, user.SystemUserId);
                var redirectUrl = new StringBuilder();
                redirectUrl.Append(OfficeSiteminderUrl);
                redirectUrl.Append("/?token=");
                redirectUrl.Append(token.AuthToken);
                return Redirect(redirectUrl.ToString());
            }
            else
            {
                var redirectUrl = new StringBuilder();
                redirectUrl.Append(AccessDeniedUrl);
                return Redirect(redirectUrl.ToString());
            }
        }

        return Ok(ApiReturnMessages.Succeeded);
    }

    private void InitializeSettings()
    {
        AdminLoginUrl = _systemSettingsService.GetValueAsync<string>(SettingKeys.AdminLoginUrl).Result;
        AdminSiteminderUrl = _systemSettingsService.GetValueAsync<string>(SettingKeys.AdminSiteMinderUrl).Result;
        IntakeLoginUrl = _systemSettingsService.GetValueAsync<string>(SettingKeys.IntakeLoginUrl).Result;
        IntakeSiteminderUrl = _systemSettingsService.GetValueAsync<string>(SettingKeys.IntakeSiteMinderUrl).Result;
        AdditionalLandlordIntakeLoginUrl = _systemSettingsService.GetValueAsync<string>(SettingKeys.AdditionalLandlordIntakeLoginUrl).Result;
        AdditionalLandlordIntakeSiteminderUrl = _systemSettingsService.GetValueAsync<string>(SettingKeys.AdditionalLandlordIntakeSiteminderUrl).Result;
        OfficeLoginUrl = _systemSettingsService.GetValueAsync<string>(SettingKeys.OfficeLoginUrl).Result;
        OfficeSiteminderUrl = _systemSettingsService.GetValueAsync<string>(SettingKeys.OfficeSiteMinderUrl).Result;
        AccessDeniedUrl = _systemSettingsService.GetValueAsync<string>(SettingKeys.AccessDeniedUrl).Result;
    }
}