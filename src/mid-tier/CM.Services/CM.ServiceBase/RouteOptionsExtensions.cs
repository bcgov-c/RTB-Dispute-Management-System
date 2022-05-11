using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;

namespace CM.ServiceBase;

public static class RouteOptionsExtensions
{
    public static void UseCentralRoutePrefix(this MvcOptions opts, IRouteTemplateProvider routeAttribute)
    {
        opts.Conventions.Insert(0, new RouteConvention(routeAttribute));
    }
}