using System.Net.Http;
using CM.Business.Entities.Models.EmailTemplate;
using CM.Integration.Tests.Infrastructure;
using Microsoft.AspNetCore.JsonPatch;

namespace CM.Integration.Tests.Helpers;

public static class EmailTemplateManager
{
    public static EntityWithStatus<EmailTemplateResponse> CreateEmailTemplate(HttpClient client, EmailTemplateRequest request)
    {
        return client.PostAsync<EmailTemplateResponse>(RouteHelper.PostEmailTemplate, request);
    }

    public static EntityWithStatus<EmailTemplateResponse> PatchEmailTemplate(HttpClient client, int emailTemplateId, EmailTemplateRequest request)
    {
        var patchDoc = new JsonPatchDocument<EmailTemplateRequest>();
        if (request.SubjectLine != null)
        {
            patchDoc.Replace(e => e.SubjectLine, request.SubjectLine);
        }

        return client.PatchAsync<EmailTemplateResponse>(RouteHelper.PatchEmailTemplate + emailTemplateId, patchDoc);
    }

    public static HttpResponseMessage DeleteEmailTemplate(HttpClient client, int emailTemplateId)
    {
        var response = client.DeleteAsync(RouteHelper.DeleteEmailTemplate + emailTemplateId).Result;
        return response;
    }

    public static EntityWithStatus<EmailTemplateResponse> GetEmailTemplate(HttpClient client, int emailTemplateId)
    {
        return client.GetAsync<EmailTemplateResponse>(RouteHelper.GetEmailTemplate + emailTemplateId);
    }

    public static EntityWithStatus<EmailTemplateListResponse> GetEmailTemplates(HttpClient client)
    {
        return client.GetAsync<EmailTemplateListResponse>(RouteHelper.GetEmailTemplates);
    }
}