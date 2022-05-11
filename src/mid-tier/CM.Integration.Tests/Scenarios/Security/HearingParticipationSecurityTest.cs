using System.Net;
using CM.Business.Entities.Models.Hearing;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckHearingParticipationSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        var hParticipationPostResponse = HearingParticipationManager.CreateHearingParticipation(Client, Data.Hearings[0].HearingId, new HearingParticipationRequest { DisputeGuid = Data.Dispute.DisputeGuid });
        hParticipationPostResponse.CheckStatusCode();

        var hParticipationPatchResponse = HearingParticipationManager.PatchHearingParticipation(Client, Data.HearingParticipationList[1].HearingParticipationId, new HearingParticipationRequest());
        hParticipationPatchResponse.CheckStatusCode();

        var hParticipationDeleteResponse = HearingParticipationManager.DeleteHearingParticipation(Client, Data.HearingParticipationList[0].HearingParticipationId);
        hParticipationDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        hParticipationPostResponse = HearingParticipationManager.CreateHearingParticipation(Client, Data.Hearings[1].HearingId, new HearingParticipationRequest { DisputeGuid = Data.Dispute.DisputeGuid });
        hParticipationPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        hParticipationPatchResponse = HearingParticipationManager.PatchHearingParticipation(Client, Data.HearingParticipationList[1].HearingParticipationId, new HearingParticipationRequest());
        hParticipationPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        hParticipationDeleteResponse = HearingParticipationManager.DeleteHearingParticipation(Client, Data.HearingParticipationList[2].HearingParticipationId);
        hParticipationDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS UNAUTHORIZED EXTERNAL USER //
        Client.Authenticate(Users.User2, Users.User2);

        hParticipationPostResponse = HearingParticipationManager.CreateHearingParticipation(Client, Data.Hearings[2].HearingId, new HearingParticipationRequest { DisputeGuid = Data.Dispute.DisputeGuid });
        hParticipationPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        hParticipationPatchResponse = HearingParticipationManager.PatchHearingParticipation(Client, Data.HearingParticipationList[1].HearingParticipationId, new HearingParticipationRequest());
        hParticipationPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        hParticipationDeleteResponse = HearingParticipationManager.DeleteHearingParticipation(Client, Data.HearingParticipationList[2].HearingParticipationId);
        hParticipationDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        hParticipationPostResponse = HearingParticipationManager.CreateHearingParticipation(Client, Data.Hearings[3].HearingId, new HearingParticipationRequest { DisputeGuid = Data.Dispute.DisputeGuid });
        hParticipationPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        hParticipationPatchResponse = HearingParticipationManager.PatchHearingParticipation(Client, Data.HearingParticipationList[1].HearingParticipationId, new HearingParticipationRequest());
        hParticipationPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        hParticipationDeleteResponse = HearingParticipationManager.DeleteHearingParticipation(Client, Data.HearingParticipationList[2].HearingParticipationId);
        hParticipationDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        hParticipationPostResponse = HearingParticipationManager.CreateHearingParticipation(Client, Data.Hearings[4].HearingId, new HearingParticipationRequest { DisputeGuid = Data.Dispute.DisputeGuid });
        hParticipationPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        hParticipationPatchResponse = HearingParticipationManager.PatchHearingParticipation(Client, Data.HearingParticipationList[1].HearingParticipationId, new HearingParticipationRequest());
        hParticipationPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        hParticipationDeleteResponse = HearingParticipationManager.DeleteHearingParticipation(Client, Data.HearingParticipationList[2].HearingParticipationId);
        hParticipationDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}