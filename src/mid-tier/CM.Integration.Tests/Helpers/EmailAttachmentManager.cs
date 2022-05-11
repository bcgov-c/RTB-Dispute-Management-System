using System.Collections.Generic;
using System.Net.Http;
using CM.Business.Entities.Models.EmailAttachment;
using CM.Integration.Tests.Infrastructure;

namespace CM.Integration.Tests.Helpers;

public static class EmailAttachmentManager
{
    public static EntityWithStatus<EmailAttachmentResponse> CreateEmailAttachment(HttpClient client, int emailId, EmailAttachmentRequest request)
    {
        return client.PostAsync<EmailAttachmentResponse>(RouteHelper.PostEmailAttachment + emailId, request);
    }

    public static EntityWithStatus<List<EmailAttachmentResponse>> GetEmailAttachments(HttpClient client, int emailId)
    {
        return client.GetAsync<List<EmailAttachmentResponse>>(RouteHelper.GetEmailAttachments + emailId);
    }

    public static HttpResponseMessage DeleteEmailAttachment(HttpClient client, int emailAttachmentId)
    {
        var response = client.DeleteAsync(RouteHelper.DeleteEmailAttachment + emailAttachmentId).Result;
        return response;
    }
}