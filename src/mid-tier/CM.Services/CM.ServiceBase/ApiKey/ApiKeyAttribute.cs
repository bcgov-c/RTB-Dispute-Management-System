using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace CM.ServiceBase.ApiKey;

[AttributeUsage(validOn: AttributeTargets.Class)]
public class ApiKeyAttribute : Attribute, IAsyncActionFilter
{
    private const string ApiKeyName = "x-api-key";

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        if (!context.HttpContext.Request.Headers.TryGetValue(ApiKeyName, out var extractedApiKey))
        {
            context.Result = new ContentResult
            {
                StatusCode = 401,
                Content = "Api Key was not provided"
            };

            return;
        }

        var appSettings = context.HttpContext.RequestServices.GetRequiredService<IOptions<ApiKeySettings>>();
        var apiKey = appSettings.Value.ApiKey;

        if (!apiKey.Equals(extractedApiKey))
        {
            context.Result = new ContentResult
            {
                StatusCode = 401,
                Content = "Api Key is not valid"
            };

            return;
        }

        await next();
    }
}