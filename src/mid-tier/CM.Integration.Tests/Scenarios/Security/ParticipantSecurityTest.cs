using System.Collections.Generic;
using System.Linq;
using System.Net;
using CM.Business.Entities.Models.Parties;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Theory]
    [InlineData(Users.Admin, Users.Admin, HttpStatusCode.OK)]
    [InlineData(Users.User, Users.User, HttpStatusCode.OK)]
    [InlineData(Users.User2, Users.User2, HttpStatusCode.Unauthorized)]
    [InlineData(Users.RemoteOffice, Users.RemoteOffice, HttpStatusCode.Unauthorized)]
    public void CheckParticipantSecurity(string userName, string password, HttpStatusCode httpStatusCode)
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        var partyRequest = new List<ParticipantRequest> { RequestExamples.GetParticipantPostRequest_1() };

        var partyResponse = ParticipantManager.CreateParticipant(Client, Data.Dispute.DisputeGuid, partyRequest);
        partyResponse.CheckStatusCode();

        var participantId = partyResponse.ResponseObject.First().ParticipantId;

        Client.Authenticate(userName, password);

        var partyPatchResponse = ParticipantManager.PatchParticipant(Client, participantId, new ParticipantRequest());
        partyPatchResponse.ResponseMessage.StatusCode.Should().Be(httpStatusCode);

        var partyGetResponse = ParticipantManager.GetParticipant(Client, participantId);
        partyGetResponse.ResponseMessage.StatusCode.Should().Be(httpStatusCode);

        var partyGetDisputePartiesResponse = ParticipantManager.GetDisputeParticipants(Client, Data.Dispute.DisputeGuid);
        partyGetDisputePartiesResponse.ResponseMessage.StatusCode.Should().Be(httpStatusCode);

        var partyDeleteResponse = ParticipantManager.DeleteParticipant(Client, participantId);
        partyDeleteResponse.StatusCode.Should().Be(httpStatusCode);
    }

    [Fact]
    public void ParticipantAccessCodeSecurity()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        var partyRequest = new List<ParticipantRequest> { RequestExamples.GetParticipantPostRequest_1() };

        var partyResponse = ParticipantManager.CreateParticipant(Client, Data.Dispute.DisputeGuid, partyRequest);
        partyResponse.CheckStatusCode();

        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        var participantId = partyResponse.ResponseObject.First().ParticipantId;

        var partyPatchResponse = ParticipantManager.PatchParticipant(Client, participantId, new ParticipantRequest());
        partyPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        var partyGetResponse = ParticipantManager.GetParticipant(Client, participantId);
        partyGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        var partyGetDisputePartiesResponse = ParticipantManager.GetDisputeParticipants(Client, Data.Dispute.DisputeGuid);
        partyGetDisputePartiesResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        var partyDeleteResponse = ParticipantManager.DeleteParticipant(Client, participantId);
        partyDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}