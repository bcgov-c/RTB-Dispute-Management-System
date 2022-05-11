using System.Net;
using CM.Business.Entities.Models.ConferenceBridge;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckConferenceBridgeSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        var conferenceBridgePostResponse = ConferenceBridgeManager.CreateConferenceBridge(Client, new ConferenceBridgeRequest());
        conferenceBridgePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var conferenceBridgePatchResponse = ConferenceBridgeManager.PatchConferenceBridge(Client, Data.ConferenceBridges[1].ConferenceBridgeId, new ConferenceBridgeRequest());
        conferenceBridgePatchResponse.CheckStatusCode();

        var conferenceBridgeGetResponse = ConferenceBridgeManager.GetConferenceBridge(Client, Data.ConferenceBridges[1].ConferenceBridgeId);
        conferenceBridgeGetResponse.CheckStatusCode();

        var conferenceBridgesGetResponse = ConferenceBridgeManager.GetConferenceBridges(Client);
        conferenceBridgesGetResponse.CheckStatusCode();

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        conferenceBridgePostResponse = ConferenceBridgeManager.CreateConferenceBridge(Client, new ConferenceBridgeRequest());
        conferenceBridgePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        conferenceBridgePatchResponse = ConferenceBridgeManager.PatchConferenceBridge(Client, Data.ConferenceBridges[1].ConferenceBridgeId, new ConferenceBridgeRequest());
        conferenceBridgePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        conferenceBridgeGetResponse = ConferenceBridgeManager.GetConferenceBridge(Client, Data.ConferenceBridges[1].ConferenceBridgeId);
        conferenceBridgeGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        conferenceBridgesGetResponse = ConferenceBridgeManager.GetConferenceBridges(Client);
        conferenceBridgesGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS UNAUTHORIZED EXTERNAL USER //
        Client.Authenticate(Users.User2, Users.User2);

        conferenceBridgePostResponse = ConferenceBridgeManager.CreateConferenceBridge(Client, new ConferenceBridgeRequest());
        conferenceBridgePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        conferenceBridgePatchResponse = ConferenceBridgeManager.PatchConferenceBridge(Client, Data.ConferenceBridges[1].ConferenceBridgeId, new ConferenceBridgeRequest());
        conferenceBridgePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        conferenceBridgeGetResponse = ConferenceBridgeManager.GetConferenceBridge(Client, Data.ConferenceBridges[1].ConferenceBridgeId);
        conferenceBridgeGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        conferenceBridgesGetResponse = ConferenceBridgeManager.GetConferenceBridges(Client);
        conferenceBridgesGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        conferenceBridgePostResponse = ConferenceBridgeManager.CreateConferenceBridge(Client, new ConferenceBridgeRequest());
        conferenceBridgePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        conferenceBridgePatchResponse = ConferenceBridgeManager.PatchConferenceBridge(Client, Data.ConferenceBridges[1].ConferenceBridgeId, new ConferenceBridgeRequest());
        conferenceBridgePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        conferenceBridgeGetResponse = ConferenceBridgeManager.GetConferenceBridge(Client, Data.ConferenceBridges[1].ConferenceBridgeId);
        conferenceBridgeGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        conferenceBridgesGetResponse = ConferenceBridgeManager.GetConferenceBridges(Client);
        conferenceBridgesGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        conferenceBridgePostResponse = ConferenceBridgeManager.CreateConferenceBridge(Client, new ConferenceBridgeRequest());
        conferenceBridgePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        conferenceBridgePatchResponse = ConferenceBridgeManager.PatchConferenceBridge(Client, Data.ConferenceBridges[1].ConferenceBridgeId, new ConferenceBridgeRequest());
        conferenceBridgePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        conferenceBridgeGetResponse = ConferenceBridgeManager.GetConferenceBridge(Client, Data.ConferenceBridges[1].ConferenceBridgeId);
        conferenceBridgeGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        conferenceBridgesGetResponse = ConferenceBridgeManager.GetConferenceBridges(Client);
        conferenceBridgesGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}