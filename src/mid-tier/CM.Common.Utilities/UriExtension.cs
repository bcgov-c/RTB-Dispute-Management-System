using System;
using Microsoft.Extensions.Configuration;

namespace CM.Common.Utilities;

public static class UriExtension
{
    public static string GetServiceRoutePrefix(this IConfiguration configuration)
    {
        var prefix = configuration[$"Service:RoutePrefix"];
        return string.IsNullOrWhiteSpace(prefix) ? "api" : prefix;
    }

    public static Uri GetServiceHealth(this IConfiguration configuration, string serviceName)
    {
        var serviceUri = configuration.GetServiceUri(serviceName);
        return new Uri(serviceUri, "check");
    }

    private static Uri GetServiceUri(this IConfiguration configuration, string serviceName)
    {
        var uri = configuration[$"Services:{serviceName}"];

        if (string.IsNullOrWhiteSpace(uri))
        {
            throw new AggregateException($"{serviceName} is missing in Services section");
        }

        return new Uri(uri);
    }
}