using System.Net;
using CM.Business.Entities.Models.DisputeFlag;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckDisputeFlagSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        var disputeFlagPostResponse = DisputeFlagManager.CreateDisputeFlag(Client, Data.Dispute.DisputeGuid, new PostDisputeFlagRequest
        {
            FlagStatus = 1,
            FlagType = 2,
            IsPublic = true
        });
        disputeFlagPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        var disputeFlagPatchResponse = DisputeFlagManager.UpdateDisputeFlag(Client, Data.DisputeFlags[0].DisputeFlagId, new PatchDisputeFlagRequest { FlagTitle = "Test" });
        disputeFlagPatchResponse.CheckStatusCode();

        var disputeFlagDeleteResponse = DisputeFlagManager.DeleteDisputeFlag(Client, Data.DisputeFlags[1].DisputeFlagId);
        disputeFlagDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var disputeFlagGetResponse = DisputeFlagManager.GetDisputeFlag(Client, Data.DisputeFlags[0].DisputeFlagId);
        disputeFlagGetResponse.CheckStatusCode();

        var disputeFlagsGetResponse = DisputeFlagManager.GetDisputeFlags(Client, Data.Dispute.DisputeGuid);
        disputeFlagsGetResponse.CheckStatusCode();

        var disputeFlagsGetLinkedResponse = DisputeFlagManager.GetLinkedDisputeFlags(Client, Data.Dispute.DisputeGuid);
        disputeFlagsGetLinkedResponse.CheckStatusCode();

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        disputeFlagPostResponse = DisputeFlagManager.CreateDisputeFlag(Client, Data.Dispute.DisputeGuid, new PostDisputeFlagRequest
        {
            FlagStatus = 1,
            FlagType = 2,
            IsPublic = true
        });
        disputeFlagPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        disputeFlagPatchResponse = DisputeFlagManager.UpdateDisputeFlag(Client, Data.DisputeFlags[0].DisputeFlagId, new PatchDisputeFlagRequest { FlagTitle = "Test" });
        disputeFlagPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeFlagDeleteResponse = DisputeFlagManager.DeleteDisputeFlag(Client, Data.DisputeFlags[1].DisputeFlagId);
        disputeFlagDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeFlagGetResponse = DisputeFlagManager.GetDisputeFlag(Client, Data.DisputeFlags[0].DisputeFlagId);
        disputeFlagGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeFlagsGetResponse = DisputeFlagManager.GetDisputeFlags(Client, Data.Dispute.DisputeGuid);
        disputeFlagsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeFlagsGetLinkedResponse = DisputeFlagManager.GetLinkedDisputeFlags(Client, Data.Dispute.DisputeGuid);
        disputeFlagsGetLinkedResponse.CheckStatusCode();

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        disputeFlagPostResponse = DisputeFlagManager.CreateDisputeFlag(Client, Data.Dispute.DisputeGuid, new PostDisputeFlagRequest
        {
            FlagStatus = 1,
            FlagType = 2,
            IsPublic = true
        });
        disputeFlagPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        disputeFlagPatchResponse = DisputeFlagManager.UpdateDisputeFlag(Client, Data.DisputeFlags[0].DisputeFlagId, new PatchDisputeFlagRequest { FlagTitle = "Test" });
        disputeFlagPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeFlagDeleteResponse = DisputeFlagManager.DeleteDisputeFlag(Client, Data.DisputeFlags[1].DisputeFlagId);
        disputeFlagDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeFlagGetResponse = DisputeFlagManager.GetDisputeFlag(Client, Data.DisputeFlags[0].DisputeFlagId);
        disputeFlagGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeFlagsGetResponse = DisputeFlagManager.GetDisputeFlags(Client, Data.Dispute.DisputeGuid);
        disputeFlagsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeFlagsGetLinkedResponse = DisputeFlagManager.GetLinkedDisputeFlags(Client, Data.Dispute.DisputeGuid);
        disputeFlagsGetLinkedResponse.CheckStatusCode();

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        disputeFlagPostResponse = DisputeFlagManager.CreateDisputeFlag(Client, Data.Dispute.DisputeGuid, new PostDisputeFlagRequest
        {
            FlagStatus = 1,
            FlagType = 2,
            IsPublic = true
        });
        disputeFlagPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        disputeFlagPatchResponse = DisputeFlagManager.UpdateDisputeFlag(Client, Data.DisputeFlags[0].DisputeFlagId, new PatchDisputeFlagRequest { FlagTitle = "Test" });
        disputeFlagPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeFlagDeleteResponse = DisputeFlagManager.DeleteDisputeFlag(Client, Data.DisputeFlags[1].DisputeFlagId);
        disputeFlagDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeFlagGetResponse = DisputeFlagManager.GetDisputeFlag(Client, Data.DisputeFlags[0].DisputeFlagId);
        disputeFlagGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeFlagsGetResponse = DisputeFlagManager.GetDisputeFlags(Client, Data.Dispute.DisputeGuid);
        disputeFlagsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeFlagsGetLinkedResponse = DisputeFlagManager.GetLinkedDisputeFlags(Client, Data.Dispute.DisputeGuid);
        disputeFlagsGetLinkedResponse.CheckStatusCode();
    }
}