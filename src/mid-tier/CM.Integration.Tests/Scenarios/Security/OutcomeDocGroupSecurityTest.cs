using System.Net;
using CM.Business.Entities.Models.OutcomeDocument;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckOutcomeDocGroupSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        var outcomeDocGroupPostResponse = OutcomeDocGroupManager.CreateOutcomeDocGroup(Client, Data.Dispute.DisputeGuid, new OutcomeDocGroupRequest { DocGroupType = 1 });
        outcomeDocGroupPostResponse.CheckStatusCode();

        var outcomeDocGroupPatchResponse = OutcomeDocGroupManager.UpdateOutcomeDocGroup(Client, Data.OutcomeDocGroups[1].OutcomeDocGroupId, new OutcomeDocGroupPatchRequest());
        outcomeDocGroupPatchResponse.CheckStatusCode();

        var outcomeDocGroupDeleteResponse = OutcomeDocGroupManager.DeleteOutcomeDocGroup(Client, Data.OutcomeDocGroups[5].OutcomeDocGroupId);
        outcomeDocGroupDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var outcomeDocGroupGetResponse = OutcomeDocGroupManager.GetOutcomeDocGroup(Client, Data.OutcomeDocGroups[1].OutcomeDocGroupId);
        outcomeDocGroupGetResponse.CheckStatusCode();

        var outcomeDocGroupGetAllResponse = OutcomeDocGroupManager.GetDisputeOutcomeDocGroups(Client, Data.Dispute.DisputeGuid);
        outcomeDocGroupGetAllResponse.CheckStatusCode();

        var externalOutcomeDocGroupResponse = OutcomeDocGroupManager.GetExternalOutcomeDocGroups(Client, Data.Dispute.DisputeGuid, new ExternalOutcomeDocGroupRequest() { DeliveryParticipantIds = new int[] { Data.Participant.ParticipantId } });
        externalOutcomeDocGroupResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        outcomeDocGroupPostResponse = OutcomeDocGroupManager.CreateOutcomeDocGroup(Client, Data.Dispute.DisputeGuid, new OutcomeDocGroupRequest { DocGroupType = 1 });
        outcomeDocGroupPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        outcomeDocGroupPatchResponse = OutcomeDocGroupManager.UpdateOutcomeDocGroup(Client, Data.OutcomeDocGroups[1].OutcomeDocGroupId, new OutcomeDocGroupPatchRequest());
        outcomeDocGroupPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        outcomeDocGroupDeleteResponse = OutcomeDocGroupManager.DeleteOutcomeDocGroup(Client, Data.OutcomeDocGroups[5].OutcomeDocGroupId);
        outcomeDocGroupDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        outcomeDocGroupGetResponse = OutcomeDocGroupManager.GetOutcomeDocGroup(Client, Data.OutcomeDocGroups[1].OutcomeDocGroupId);
        outcomeDocGroupGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        outcomeDocGroupGetAllResponse = OutcomeDocGroupManager.GetDisputeOutcomeDocGroups(Client, Data.Dispute.DisputeGuid);
        outcomeDocGroupGetAllResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        externalOutcomeDocGroupResponse = OutcomeDocGroupManager.GetExternalOutcomeDocGroups(Client, Data.Dispute.DisputeGuid, new ExternalOutcomeDocGroupRequest() { DeliveryParticipantIds = new int[] { Data.Participant.ParticipantId } });
        externalOutcomeDocGroupResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

        // LOGIN AS EXTERNAL User2
        Client.Authenticate(Users.User2, Users.User2);

        externalOutcomeDocGroupResponse = OutcomeDocGroupManager.GetExternalOutcomeDocGroups(Client, Data.Dispute.DisputeGuid, new ExternalOutcomeDocGroupRequest() { DeliveryParticipantIds = new int[] { Data.Participant.ParticipantId } });
        externalOutcomeDocGroupResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        outcomeDocGroupPostResponse = OutcomeDocGroupManager.CreateOutcomeDocGroup(Client, Data.Dispute.DisputeGuid, new OutcomeDocGroupRequest { DocGroupType = 1 });
        outcomeDocGroupPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        outcomeDocGroupPatchResponse = OutcomeDocGroupManager.UpdateOutcomeDocGroup(Client, Data.OutcomeDocGroups[1].OutcomeDocGroupId, new OutcomeDocGroupPatchRequest());
        outcomeDocGroupPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        outcomeDocGroupDeleteResponse = OutcomeDocGroupManager.DeleteOutcomeDocGroup(Client, Data.OutcomeDocGroups[5].OutcomeDocGroupId);
        outcomeDocGroupDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        outcomeDocGroupGetResponse = OutcomeDocGroupManager.GetOutcomeDocGroup(Client, Data.OutcomeDocGroups[1].OutcomeDocGroupId);
        outcomeDocGroupGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        outcomeDocGroupGetAllResponse = OutcomeDocGroupManager.GetDisputeOutcomeDocGroups(Client, Data.Dispute.DisputeGuid);
        outcomeDocGroupGetAllResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        externalOutcomeDocGroupResponse = OutcomeDocGroupManager.GetExternalOutcomeDocGroups(Client, Data.Dispute.DisputeGuid, new ExternalOutcomeDocGroupRequest() { DeliveryParticipantIds = new int[] { Data.Participant.ParticipantId } });
        externalOutcomeDocGroupResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        outcomeDocGroupPostResponse = OutcomeDocGroupManager.CreateOutcomeDocGroup(Client, Data.Dispute.DisputeGuid, new OutcomeDocGroupRequest { DocGroupType = 1 });
        outcomeDocGroupPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        outcomeDocGroupPatchResponse = OutcomeDocGroupManager.UpdateOutcomeDocGroup(Client, Data.OutcomeDocGroups[1].OutcomeDocGroupId, new OutcomeDocGroupPatchRequest());
        outcomeDocGroupPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        outcomeDocGroupDeleteResponse = OutcomeDocGroupManager.DeleteOutcomeDocGroup(Client, Data.OutcomeDocGroups[5].OutcomeDocGroupId);
        outcomeDocGroupDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        outcomeDocGroupGetResponse = OutcomeDocGroupManager.GetOutcomeDocGroup(Client, Data.OutcomeDocGroups[1].OutcomeDocGroupId);
        outcomeDocGroupGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        outcomeDocGroupGetAllResponse = OutcomeDocGroupManager.GetDisputeOutcomeDocGroups(Client, Data.Dispute.DisputeGuid);
        outcomeDocGroupGetAllResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        externalOutcomeDocGroupResponse = OutcomeDocGroupManager.GetExternalOutcomeDocGroups(Client, Data.Dispute.DisputeGuid, new ExternalOutcomeDocGroupRequest() { DeliveryParticipantIds = new int[] { Data.Participant.ParticipantId } });
        externalOutcomeDocGroupResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);
    }
}