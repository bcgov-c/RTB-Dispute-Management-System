using System;
using System.Net;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Integration;

public partial class IntegrationTests
{
    [Theory]
    [InlineData(Users.User, Users.User)]
    [InlineData(Users.Admin, Users.Admin)]
    public async Task AuthenticateOkResponse(string userName, string password)
    {
        Context.Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", Convert.ToBase64String(System.Text.Encoding.ASCII.GetBytes($"{userName}:{password}")));
        var response = await Context.Client.PostAsync(RouteHelper.Authenticate, null!);
        Assert.True(response.StatusCode.Equals(HttpStatusCode.OK));

        response.EnsureSuccessStatusCode();

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Theory]
    [InlineData("user-xxx", "user-xxx")]
    public async Task AuthenticateUnauthorisedResponse(string userName, string password)
    {
        Context.Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", Convert.ToBase64String(System.Text.Encoding.ASCII.GetBytes($"{userName}:{password}")));
        var response = await Context.Client.PostAsync(RouteHelper.Authenticate, null!);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}