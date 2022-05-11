using System.Collections.Generic;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DataWarehouseReporting.API;

[Route("")]
public class Account : Controller
{
    [Route("")]
    [Authorize]
    public ActionResult Index()
    {
        return Redirect("graphql");
    }

    [Route("logout")]
    public IActionResult LogOut()
    {
        return new SignOutResult(new List<string> { CookieAuthenticationDefaults.AuthenticationScheme, OpenIdConnectDefaults.AuthenticationScheme });
    }
}