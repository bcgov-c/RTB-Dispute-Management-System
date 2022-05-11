using Microsoft.AspNetCore.Builder;

namespace CM.ServiceBase;

public static class EnableRequestBufferingExtension
{
    public static IApplicationBuilder UseEnableRequestBuffering(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<EnableRequestBufferingMiddleware>();
    }
}