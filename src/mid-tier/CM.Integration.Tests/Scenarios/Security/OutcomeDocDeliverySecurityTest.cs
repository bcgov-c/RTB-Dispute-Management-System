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
    public void CheckOutcomeDocDeliverySecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        var outcomeDocDeliveryPostResponse = OutcomeDocDeliveryManager.CreateOutcomeDocDelivery(Client, Data.OutcomeDocFiles[7].OutcomeDocFileId, new OutcomeDocDeliveryPostRequest { DisputeGuid = Data.Dispute.DisputeGuid });
        outcomeDocDeliveryPostResponse.CheckStatusCode();

        var outcomeDocDeliveryPatchResponse = OutcomeDocDeliveryManager.UpdateOutcomeDocDelivery(Client, Data.OutcomeDocDeliveries[1].OutcomeDocDeliveryId, new OutcomeDocDeliveryPatchRequest());
        outcomeDocDeliveryPatchResponse.CheckStatusCode();

        var outcomeDocDeliveryDeleteResponse = OutcomeDocDeliveryManager.DeleteOutcomeDocDelivery(Client, Data.OutcomeDocDeliveries[5].OutcomeDocDeliveryId);
        outcomeDocDeliveryDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var outcomeDocDeliveryGetResponse = OutcomeDocDeliveryManager.GetUndelivered(Client);
        outcomeDocDeliveryGetResponse.CheckStatusCode();

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        outcomeDocDeliveryPostResponse = OutcomeDocDeliveryManager.CreateOutcomeDocDelivery(Client, Data.OutcomeDocFiles[7].OutcomeDocFileId, new OutcomeDocDeliveryPostRequest { DisputeGuid = Data.Dispute.DisputeGuid });
        outcomeDocDeliveryPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        outcomeDocDeliveryPatchResponse = OutcomeDocDeliveryManager.UpdateOutcomeDocDelivery(Client, Data.OutcomeDocDeliveries[1].OutcomeDocDeliveryId, new OutcomeDocDeliveryPatchRequest());
        outcomeDocDeliveryPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        outcomeDocDeliveryDeleteResponse = OutcomeDocDeliveryManager.DeleteOutcomeDocDelivery(Client, Data.OutcomeDocDeliveries[5].OutcomeDocDeliveryId);
        outcomeDocDeliveryDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        outcomeDocDeliveryGetResponse = OutcomeDocDeliveryManager.GetUndelivered(Client);
        outcomeDocDeliveryGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        outcomeDocDeliveryPostResponse = OutcomeDocDeliveryManager.CreateOutcomeDocDelivery(Client, Data.OutcomeDocFiles[7].OutcomeDocFileId, new OutcomeDocDeliveryPostRequest { DisputeGuid = Data.Dispute.DisputeGuid });
        outcomeDocDeliveryPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        outcomeDocDeliveryPatchResponse = OutcomeDocDeliveryManager.UpdateOutcomeDocDelivery(Client, Data.OutcomeDocDeliveries[1].OutcomeDocDeliveryId, new OutcomeDocDeliveryPatchRequest());
        outcomeDocDeliveryPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        outcomeDocDeliveryDeleteResponse = OutcomeDocDeliveryManager.DeleteOutcomeDocDelivery(Client, Data.OutcomeDocDeliveries[5].OutcomeDocDeliveryId);
        outcomeDocDeliveryDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        outcomeDocDeliveryGetResponse = OutcomeDocDeliveryManager.GetUndelivered(Client);
        outcomeDocDeliveryGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        outcomeDocDeliveryPostResponse = OutcomeDocDeliveryManager.CreateOutcomeDocDelivery(Client, Data.OutcomeDocFiles[7].OutcomeDocFileId, new OutcomeDocDeliveryPostRequest { DisputeGuid = Data.Dispute.DisputeGuid });
        outcomeDocDeliveryPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        outcomeDocDeliveryPatchResponse = OutcomeDocDeliveryManager.UpdateOutcomeDocDelivery(Client, Data.OutcomeDocDeliveries[1].OutcomeDocDeliveryId, new OutcomeDocDeliveryPatchRequest());
        outcomeDocDeliveryPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        outcomeDocDeliveryDeleteResponse = OutcomeDocDeliveryManager.DeleteOutcomeDocDelivery(Client, Data.OutcomeDocDeliveries[5].OutcomeDocDeliveryId);
        outcomeDocDeliveryDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        outcomeDocDeliveryGetResponse = OutcomeDocDeliveryManager.GetUndelivered(Client);
        outcomeDocDeliveryGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}