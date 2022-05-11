using System;
using System.Linq;
using CM.Common.Utilities;
using Microsoft.AspNetCore.Http;

namespace CM.WebAPI.WebApiHelpers;

public static class HttpRequestMessageExtensions
{
    public static string GetToken(this HttpRequest request)
    {
        if (request.Headers.TryGetValue(ApiHeader.Token, out var headerValue))
        {
            var valueString = headerValue.FirstOrDefault();
            if (valueString != null)
            {
                return valueString;
            }
        }

        return string.Empty;
    }

    public static Guid GetDisputeGuid(this HttpRequest request)
    {
        if (request.Headers.TryGetValue(ApiHeader.DisputeGuidToken, out var headerValue))
        {
            var valueString = headerValue.FirstOrDefault();
            if (valueString != null)
            {
                Guid.TryParse(valueString, out var disputeGuid);
                return disputeGuid;
            }
        }

        return Guid.Empty;
    }

    public static string GetTokenFromResponse(this HttpResponse response)
    {
        if (response.Headers.TryGetValue(ApiHeader.Token, out var headerValue))
        {
            var valueString = headerValue.FirstOrDefault();
            if (valueString != null)
            {
                return valueString;
            }
        }

        return string.Empty;
    }
}