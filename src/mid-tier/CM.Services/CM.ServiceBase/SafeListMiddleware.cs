using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace CM.ServiceBase;

public class SafeListMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<SafeListMiddleware> _logger;
    private readonly List<string> _safeList;

    public SafeListMiddleware(
        RequestDelegate next,
        ILogger<SafeListMiddleware> logger,
        List<string> safeList)
    {
        _next = next;
        _logger = logger;
        _safeList = safeList;
    }

    public async Task Invoke(HttpContext context)
    {
        if (!IsValidRequest(context.Request))
        {
            _logger.LogWarning("Forbidden Request from Remote URL address: {UrlReferrer}", context.Request.Host);

            context.Response.StatusCode = (int)HttpStatusCode.Forbidden;
            return;
        }

        await _next.Invoke(context);
    }

    private bool IsValidRequest(HttpRequest request)
    {
        if (request.IsLocal())
        {
            return true;
        }

        var referrerUrl = string.Empty;

        if (request.Headers.ContainsKey("Referer"))
        {
            referrerUrl = request.Headers["Referer"];
        }

        if (string.IsNullOrWhiteSpace(referrerUrl))
        {
            return false;
        }

        bool isValidClient = _safeList.Contains(new Uri(referrerUrl).Authority);
        return isValidClient;
    }
}