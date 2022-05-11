using System.Net;
using Microsoft.AspNetCore.Http;

namespace CM.ServiceBase;

public static class HttpContextFilters
{
    public static bool IsLocalRequest(this HttpContext context)
    {
        return context.Connection.RemoteIpAddress != null &&
               (context.Connection.RemoteIpAddress.Equals(context.Connection.LocalIpAddress) ||
                IPAddress.IsLoopback(context.Connection.RemoteIpAddress));
    }
}