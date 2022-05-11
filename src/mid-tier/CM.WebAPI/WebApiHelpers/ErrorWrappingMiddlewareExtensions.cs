using Microsoft.AspNetCore.Builder;

namespace CM.WebAPI.WebApiHelpers;

public static class ErrorWrappingMiddlewareExtensions
{
    public static IApplicationBuilder UseErrorWrappingMiddleware(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<ErrorWrappingMiddleware>();
    }
}