using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Serilog;
using static System.Net.Mime.MediaTypeNames;

namespace CM.WebAPI.WebApiHelpers;

public class ErrorWrappingMiddleware
{
    private readonly RequestDelegate _next;

    public ErrorWrappingMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next.Invoke(context);
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Middleware exception");
            await HandleExceptionAsync(context, ex);
        }
    }

    private Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = Application.Json;
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        var response = new ApiResponse((HttpStatusCode)context.Response.StatusCode, context.TraceIdentifier, exception.Message);
        var json = JsonSerializer.Serialize(response);

        return context.Response.WriteAsync(json);
    }
}