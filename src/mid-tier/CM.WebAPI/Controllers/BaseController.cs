using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using CM.Business.Services;
using CM.Business.Services.Base;
using CM.Common.Utilities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Serilog;

namespace CM.WebAPI.Controllers;

public class BaseController : Controller
{
    protected bool CheckModified(IServiceBase service, object id)
    {
        if (Request.Headers.ContainsKey(ApiHeader.IfUnmodifiedSince))
        {
            var ifUnmodifiedSince = DateTime.Parse(Request.Headers[ApiHeader.IfUnmodifiedSince]);
            var lastModified = service.GetLastModifiedDateAsync(id).Result;

            if (lastModified?.Ticks > ifUnmodifiedSince.Ticks)
            {
                return true;
            }
        }

        return false;
    }

    protected int GetLoggedInUserId()
    {
        var username = User.Identity?.Name;

        return int.Parse(username ?? "0");
    }

    protected ObjectResult StatusConflicted(string apiReturnMessage = ApiReturnMessages.ConflictOccured)
    {
        return StatusCode(StatusCodes.Status409Conflict, apiReturnMessage);
    }

    protected void DisputeSetContext(Guid disputeGuid)
    {
        try
        {
            HttpContext.Items.Remove(ContextKeys.DisputeKey);
            HttpContext.Items.Add(ContextKeys.DisputeKey, disputeGuid);
        }
        catch (Exception e)
        {
            Log.Error(e, "DisputeSetContext error");
        }
    }

    protected void EntityIdSetContext(int entityId)
    {
        try
        {
            HttpContext.Items.Remove(ContextKeys.EntityId);
            HttpContext.Items.Add(ContextKeys.EntityId, entityId);
        }
        catch (Exception e)
        {
            Log.Error(e, "EntityIdSetContext error");
        }
    }

    protected void EntityGuidSetContext(Guid guid)
    {
        try
        {
            HttpContext.Items.Remove(ContextKeys.Guid);
            HttpContext.Items.Add(ContextKeys.Guid, guid);
        }
        catch (Exception e)
        {
            Log.Error(e, "EntityGuidSetContext error");
        }
    }

    protected async Task DisputeResolveAndSetContext(IDisputeResolver resolver, int id)
    {
        if (resolver != null)
        {
            try
            {
                var disputeGuid = await resolver.ResolveDisputeGuid(id);
                DisputeSetContext(disputeGuid);
            }
            catch (Exception e)
            {
                Log.Error(e, "DisputeResolveAndSetContext error");
            }
        }
    }

    protected async Task<IActionResult> MakeRequest(Uri apiBaseUri, string httpMethod, string route, Dictionary<string, string> postParams = null)
    {
        using var client = new HttpClient();

        var requestMessage = new HttpRequestMessage(new HttpMethod(httpMethod), new Uri(apiBaseUri, route));

        if (postParams != null)
        {
            requestMessage.Content = new FormUrlEncodedContent(postParams);
        }

        var response = await client.SendAsync(requestMessage);

        var apiResponse = await response.Content.ReadAsStreamAsync();

        try
        {
            CopyFromTargetResponseHeaders(HttpContext, response);
            return Ok(apiResponse);
        }
        catch (Exception exc)
        {
            return BadRequest(exc.Message);
        }
    }

    protected async Task<IActionResult> MakeRequestWithAttachment(Uri apiBaseUri, string httpMethod, string route, Dictionary<string, string> postParams = null)
    {
        using var client = new HttpClient();

        var requestMessage = new HttpRequestMessage(new HttpMethod(httpMethod), new Uri(apiBaseUri, route));

        if (postParams != null)
        {
            requestMessage.Content = new FormUrlEncodedContent(postParams);
        }

        var response = await client.SendAsync(requestMessage);

        var apiResponse = await response.Content.ReadAsByteArrayAsync();

        try
        {
            CopyFromTargetResponseHeaders(HttpContext, response);

            if (response.Content.Headers.ContentType != null)
            {
                return new FileContentResult(apiResponse, response.Content.Headers.ContentType.MediaType);
            }
        }
        catch (Exception)
        {
            return BadRequest();
        }

        return BadRequest();
    }

    private void CopyFromTargetResponseHeaders(HttpContext context, HttpResponseMessage responseMessage)
    {
        foreach (var(key, value) in responseMessage.Headers)
        {
            context.Response.Headers[key] = value.ToArray();
        }

        foreach (var(key, value) in responseMessage.Content.Headers)
        {
            context.Response.Headers[key] = value.ToArray();
        }

        context.Response.Headers.Remove("transfer-encoding");
    }
}