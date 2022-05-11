using System.Net.Http;
using CM.Business.Entities.Models.AccessCode;
using CM.Integration.Tests.Infrastructure;

namespace CM.Integration.Tests.Helpers;

public static class AccessCodeManager
{
    public static EntityWithStatus<string> AccessCodeLogin(HttpClient client, string accessCode)
    {
        return client.PostAsync<string>(RouteHelper.PostAccessCode + accessCode);
    }

    public static EntityWithStatus<DisputeClosedResponse> AccessCodeClosedDispute(HttpClient client, string accessCode)
    {
        return client.PostAsync<DisputeClosedResponse>(RouteHelper.PostAccessCode + accessCode);
    }

    public static EntityWithStatus<DisputeAccessResponse> GetAccessCodeFileInfo(HttpClient client)
    {
        return client.GetAsync<DisputeAccessResponse>(RouteHelper.GetAccessCodeFileInfo);
    }
}