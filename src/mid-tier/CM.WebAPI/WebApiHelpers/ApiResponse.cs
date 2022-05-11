using System.Net;
using System.Net.Http;
using Newtonsoft.Json;

namespace CM.WebAPI.WebApiHelpers;

public class ApiResponse
{
    public ApiResponse(HttpStatusCode statusCode, string traceIdentifier, string message = null)
    {
        Message = message ?? new HttpResponseMessage(statusCode).ReasonPhrase;
        TraceIdentifier = traceIdentifier;
    }

    [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
    public string Message { get; }

    [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
    public string TraceIdentifier { get; }
}