using System.Net.Http;
using CM.Integration.Tests.Infrastructure;

namespace CM.Integration.Tests.Helpers;

public static class TestManager
{
    public static EntityWithStatus<string> CreateRunJob(HttpClient client, string jobName)
    {
        return client.PostAsync<string>(RouteHelper.PostRunJob + jobName, null);
    }
}