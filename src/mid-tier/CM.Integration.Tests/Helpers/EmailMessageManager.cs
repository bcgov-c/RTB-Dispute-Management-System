using System;
using System.Net.Http;
using CM.Business.Entities.Models.EmailMessage;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class EmailMessageManager
{
    public static EntityWithStatus<EmailMessageResponse> CreateEmailMessage(HttpClient client, Guid disputeGuid, EmailMessageRequest request)
    {
        return client.PostAsync<EmailMessageResponse>(RouteHelper.PostEmailMessage + disputeGuid, request);
    }

    public static HttpResponseMessage DeleteEmailMessage(HttpClient client, int emailMessageId)
    {
        var response = client.DeleteAsync(RouteHelper.DeleteEmailMessage + emailMessageId).Result;
        return response;
    }

    public static EntityWithStatus<EmailMessageResponse> PatchEmailMessage(HttpClient client, int emailId, EmailMessageRequest request)
    {
        var patchDoc = new JsonPatchDocument<EmailMessageRequest>();
        if (request.HtmlBody != null)
        {
            patchDoc.Replace(e => e.HtmlBody, request.HtmlBody);
        }

        return client.PatchAsync<EmailMessageResponse>(RouteHelper.PatchEmailMessage + emailId, patchDoc);
    }

    public static EntityWithStatus<EmailMessageResponse> GetEmailMessage(HttpClient client, int emailId)
    {
        return client.GetAsync<EmailMessageResponse>(RouteHelper.GetEmailMessage + emailId);
    }

    public static EntityWithStatus<EmailMessageListResponse> GetDisputeEmailMessages(HttpClient client, Guid disputeGuid)
    {
        return client.GetAsync<EmailMessageListResponse>(RouteHelper.GetDisputeEmailMessages + disputeGuid);
    }
}