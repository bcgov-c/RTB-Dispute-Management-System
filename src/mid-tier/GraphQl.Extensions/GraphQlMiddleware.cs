using System;
using System.Net;
using System.Threading.Tasks;
using GraphQL;
using GraphQL.Instrumentation;
using GraphQL.SystemTextJson;
using GraphQL.Types;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace GraphQl.Extensions;

public class GraphQlMiddleware
{
    private readonly IDocumentExecuter _executer;
    private readonly RequestDelegate _next;

    private readonly GraphQlSettings _settings;

    private readonly IDocumentWriter _writer;

    public GraphQlMiddleware(RequestDelegate next, IOptions<GraphQlSettings> options, IDocumentExecuter executer, IDocumentWriter writer)
    {
        _next = next;
        _settings = options.Value;
        _executer = executer;
        _writer = writer;
    }

    public async Task Invoke(HttpContext context, ISchema schema)
    {
        if (!IsGraphQlRequest(context))
        {
            await _next(context);

            return;
        }

        await ExecuteAsync(context, schema);
    }

    private bool IsGraphQlRequest(HttpContext context)
    {
        return context.Request.Path.StartsWithSegments(_settings.GraphQlPath) && string.Equals(context.Request.Method, "POST", StringComparison.OrdinalIgnoreCase);
    }

    private async Task ExecuteAsync(HttpContext context, ISchema schema)
    {
        var start = DateTime.UtcNow;
        var request = await context.Request.Body.FromJsonAsync<GraphQlRequest>();

        var result = await _executer.ExecuteAsync(options =>
        {
            options.Schema = schema;

            if (request != null)
            {
                options.Query = request.Query;
                options.OperationName = request.OperationName;
                options.Inputs = request.Variables;
            }

            options.UserContext = _settings.BuildUserContext.Invoke(context);
            options.EnableMetrics = _settings.EnableMetrics;
            options.ValidationRules = _settings.ValidationRules;
            options.ThrowOnUnhandledException = false;
        });

        if (_settings.EnableMetrics)
        {
            result.EnrichWithApolloTracing(start);
        }

        await WriteResponseAsync(context, HttpStatusCode.OK, result);
    }

    private async Task WriteResponseAsync(HttpContext context, HttpStatusCode code, ExecutionResult result)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)code;

        await _writer.WriteAsync(context.Response.Body, result);
    }
}