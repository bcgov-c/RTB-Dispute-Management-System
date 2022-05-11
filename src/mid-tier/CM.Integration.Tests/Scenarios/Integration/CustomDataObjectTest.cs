using System.Linq;
using System.Net;
using CM.Business.Entities.Models.CustomDataObject;
using CM.Common.Utilities;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Integration;

public partial class IntegrationTests
{
    [Fact]
    public void CustomDataObjectsIntegration()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        var disputeResponse = DisputeManager.CreateDispute(Client);
        disputeResponse.CheckStatusCode();
        Client.SetDisputeGuidHeaderToken(disputeResponse.ResponseObject.DisputeGuid);

        var customObjectPostResponse1 = CustomObjectManager.CreateCustomDataObject(Client,
            disputeResponse.ResponseObject.DisputeGuid,
            new CustomDataObjectRequest
            {
                ObjectStatus = 1,
                Description = "Custom Desc",
                ObjectType = CustomObjectType.AriUnits,
                ObjectSubType = 2,
                ObjectJson = "{\"object 1\": \"First Object\"}"
            });

        customObjectPostResponse1.CheckStatusCode();

        var customObjectPostResponse2 = CustomObjectManager.CreateCustomDataObject(Client,
            disputeResponse.ResponseObject.DisputeGuid,
            new CustomDataObjectRequest
            {
                ObjectStatus = 1,
                Description = "Custom Desc",
                ObjectType = CustomObjectType.AriUnits,
                ObjectSubType = 2,
                ObjectJson = "{\"object 2\": \"Second Object\"}"
            });
        customObjectPostResponse2.CheckStatusCode();

        var disputeCustomObjectsGetResponse = CustomObjectManager.GetDisputeCustomObjects(Client,
            disputeResponse.ResponseObject.DisputeGuid,
            null);
        disputeCustomObjectsGetResponse.CheckStatusCode();
        disputeCustomObjectsGetResponse.ResponseObject.Count.Should().Be(2);

        disputeCustomObjectsGetResponse = CustomObjectManager.GetDisputeCustomObjects(Client,
            disputeResponse.ResponseObject.DisputeGuid,
            new CustomObjectGetRequest { IsActive = true });
        disputeCustomObjectsGetResponse.CheckStatusCode();
        disputeCustomObjectsGetResponse.ResponseObject.Count.Should().Be(1);

        var customObjectPatchResponse = CustomObjectManager.UpdateCustomDataObject(Client,
            customObjectPostResponse2.ResponseObject.CustomDataObjectId,
            new CustomObjectPatchRequest { IsAmended = true });
        customObjectPatchResponse.CheckStatusCode();

        disputeCustomObjectsGetResponse = CustomObjectManager.GetDisputeCustomObjects(Client,
            disputeResponse.ResponseObject.DisputeGuid,
            new CustomObjectGetRequest { IsActive = true });
        disputeCustomObjectsGetResponse.CheckStatusCode();
        disputeCustomObjectsGetResponse.ResponseObject.Count.Should().Be(1);
        disputeCustomObjectsGetResponse.ResponseObject.First().IsAmended.Should().Be(true);

        var customObjectDeleteResponse = CustomObjectManager.DeleteCustomDataObject(Client,
            customObjectPostResponse1.ResponseObject.CustomDataObjectId);
        customObjectDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        disputeCustomObjectsGetResponse = CustomObjectManager.GetDisputeCustomObjects(Client,
            disputeResponse.ResponseObject.DisputeGuid,
            null);
        disputeCustomObjectsGetResponse.CheckStatusCode();
        disputeCustomObjectsGetResponse.ResponseObject.Count.Should().Be(1);
    }
}