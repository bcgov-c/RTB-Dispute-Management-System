using System;
using System.Security.Principal;
using System.Text;
using System.Threading.Tasks;
using CM.Business.Services.UserServices;
using CM.Common.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace CM.WebAPI.Filters;

public class ApiAuthenticationFilter : Attribute, IAsyncAuthorizationFilter
{
    public string BasicRealm { get; set; }

    protected string Username { get; set; }

    protected string Password { get; set; }

    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var identity = FetchAuthHeader(context);

        if (identity == null)
        {
            ChallengeAuthRequest(context);
        }

        if (context.HttpContext.RequestServices.GetService(typeof(IAuthenticateService)) is IAuthenticateService service)
        {
            var token = await service.Login(Username, Password);
            context.HttpContext.Response.Headers.Add(ApiHeader.Token, token);
        }
    }

    private static void ChallengeAuthRequest(AuthorizationFilterContext context)
    {
        var dnsHost = context.HttpContext.Request.Host;
        context.HttpContext.Response.Headers.Add("WWW-Authenticate", $"Basic realm=\"{dnsHost}\"");
        context.Result = new UnauthorizedResult();
    }

    private GenericIdentity FetchAuthHeader(AuthorizationFilterContext context)
    {
        var req = context.HttpContext.Request;
        var auth = req.Headers[ApiHeader.Authorization];
        if (!string.IsNullOrEmpty(auth))
        {
            var cred = Encoding.ASCII.GetString(Convert.FromBase64String(auth.ToString().Substring(6))).Split(':');
            var user = new { Name = cred[0], Pass = cred[1] };
            if (user.Name == Username && user.Pass == Password)
            {
                return new GenericIdentity(Username, Password);
            }

            Username = user.Name;
            Password = user.Pass;
        }

        var dnsHost = context.HttpContext.Request.Host;
        context.HttpContext.Response.Headers.Add("WWW-Authenticate", $"Basic realm=\"{dnsHost}\"");

        if (string.IsNullOrEmpty(auth))
        {
            context.Result = new UnauthorizedResult();
        }

        if (string.IsNullOrWhiteSpace(Username) && string.IsNullOrWhiteSpace(Password))
        {
            Username = "guest";
            Password = "guest";
        }

        return new GenericIdentity(Username ?? string.Empty, Password);
    }
}