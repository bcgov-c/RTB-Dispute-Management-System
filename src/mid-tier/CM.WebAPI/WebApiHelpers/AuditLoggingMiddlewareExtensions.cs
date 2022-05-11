using Microsoft.AspNetCore.Builder;

namespace CM.WebAPI.WebApiHelpers;

public static class AuditLoggingMiddlewareExtensions
{
    public static IApplicationBuilder UseAuditLogging(this IApplicationBuilder builder)
    {
        return builder.UseWhen(context => context.Request.Path.StartsWithSegments("/api")
                                          && !context.Request.Path.StartsWithSegments("/api/trial")
                                          && !context.Request.Path.StartsWithSegments("/api/trialdispute")
                                          && !context.Request.Path.StartsWithSegments("/api/trialparticipant")
                                          && !context.Request.Path.StartsWithSegments("/api/trialintervention")
                                          && !context.Request.Path.StartsWithSegments("/api/trialoutcome"),
            appBuilder =>
            {
                appBuilder.UseMiddleware<AuditLoggingMiddleware>();
            });
    }
}