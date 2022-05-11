using System.Net;
using CM.Business.Entities.Models.CustomDataObject;
using CM.Common.Utilities;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckCustomDataObjectSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);
        Client.SetDisputeGuidHeaderToken(Data.Dispute.DisputeGuid);

        var customObjectPostResponse = CustomObjectManager.CreateCustomDataObject(Client, Data.Dispute.DisputeGuid, new CustomDataObjectRequest { ObjectStatus = 1, Description = "Custom Desc", ObjectType = CustomObjectType.AriUnits, ObjectSubType = 2, ObjectJson = "{\"foo\":[1,5,7,10]}" });
        customObjectPostResponse.CheckStatusCode();

        Client.SetDisputeGuidHeaderToken(Data.CustomObjects[1].DisputeGuid);
        var customObjectPatchResponse = CustomObjectManager.UpdateCustomDataObject(Client, Data.CustomObjects[1].CustomDataObjectId, new CustomObjectPatchRequest { Description = "New Desc" });
        customObjectPatchResponse.CheckStatusCode();

        var customObjectGetResponse = CustomObjectManager.GetCustomDataObject(Client, Data.CustomObjects[1].CustomDataObjectId);
        customObjectGetResponse.CheckStatusCode();

        Client.SetDisputeGuidHeaderToken(Data.Dispute.DisputeGuid);
        var disputeCustomObjectsGetResponse = CustomObjectManager.GetDisputeCustomObjects(Client, Data.Dispute.DisputeGuid, new CustomObjectGetRequest { IsActive = true });
        disputeCustomObjectsGetResponse.CheckStatusCode();

        Client.SetDisputeGuidHeaderToken(Data.CustomObjects[2].DisputeGuid);
        var customObjectDeleteResponse = CustomObjectManager.DeleteCustomDataObject(Client, Data.CustomObjects[2].CustomDataObjectId);
        customObjectDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        customObjectPostResponse = CustomObjectManager.CreateCustomDataObject(Client, Data.Dispute.DisputeGuid, new CustomDataObjectRequest { ObjectStatus = 1, Description = "Custom Desc", ObjectType = CustomObjectType.AriUnits, ObjectSubType = 2, ObjectJson = "{\"foo\":[1,5,7,10]}" });
        customObjectPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        customObjectPatchResponse = CustomObjectManager.UpdateCustomDataObject(Client, Data.CustomObjects[1].CustomDataObjectId, new CustomObjectPatchRequest { Description = "New Desc" });
        customObjectPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        customObjectGetResponse = CustomObjectManager.GetCustomDataObject(Client, Data.CustomObjects[1].CustomDataObjectId);
        customObjectGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        disputeCustomObjectsGetResponse = CustomObjectManager.GetDisputeCustomObjects(Client, Data.Dispute.DisputeGuid, new CustomObjectGetRequest { IsActive = true });
        disputeCustomObjectsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        customObjectDeleteResponse = CustomObjectManager.DeleteCustomDataObject(Client, Data.CustomObjects[3].CustomDataObjectId);
        customObjectDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // LOGIN AS UNAUTHORIZED EXTERNAL USER //
        Client.Authenticate(Users.User2, Users.User2);

        customObjectPostResponse = CustomObjectManager.CreateCustomDataObject(Client, Data.Dispute.DisputeGuid, new CustomDataObjectRequest { ObjectStatus = 1, Description = "Custom Desc", ObjectType = CustomObjectType.AriUnits, ObjectSubType = 2, ObjectJson = "{\"foo\":[1,5,7,10]}" });
        customObjectPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        customObjectPatchResponse = CustomObjectManager.UpdateCustomDataObject(Client, Data.CustomObjects[1].CustomDataObjectId, new CustomObjectPatchRequest { Description = "New Desc" });
        customObjectPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        customObjectGetResponse = CustomObjectManager.GetCustomDataObject(Client, Data.CustomObjects[1].CustomDataObjectId);
        customObjectGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeCustomObjectsGetResponse = CustomObjectManager.GetDisputeCustomObjects(Client, Data.Dispute.DisputeGuid, new CustomObjectGetRequest { IsActive = true });
        disputeCustomObjectsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        customObjectDeleteResponse = CustomObjectManager.DeleteCustomDataObject(Client, Data.CustomObjects[4].CustomDataObjectId);
        customObjectDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        customObjectPostResponse = CustomObjectManager.CreateCustomDataObject(Client, Data.Dispute.DisputeGuid, new CustomDataObjectRequest { ObjectStatus = 1, Description = "Custom Desc", ObjectType = CustomObjectType.AriUnits, ObjectSubType = 2, ObjectJson = "{\"foo\":[1,5,7,10]}" });
        customObjectPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        customObjectPatchResponse = CustomObjectManager.UpdateCustomDataObject(Client, Data.CustomObjects[1].CustomDataObjectId, new CustomObjectPatchRequest { Description = "New Desc" });
        customObjectPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        customObjectGetResponse = CustomObjectManager.GetCustomDataObject(Client, Data.CustomObjects[1].CustomDataObjectId);
        customObjectGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeCustomObjectsGetResponse = CustomObjectManager.GetDisputeCustomObjects(Client, Data.Dispute.DisputeGuid, new CustomObjectGetRequest { IsActive = true });
        disputeCustomObjectsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        customObjectDeleteResponse = CustomObjectManager.DeleteCustomDataObject(Client, Data.CustomObjects[5].CustomDataObjectId);
        customObjectDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        customObjectPostResponse = CustomObjectManager.CreateCustomDataObject(Client, Data.Dispute.DisputeGuid, new CustomDataObjectRequest { ObjectStatus = 1, Description = "Custom Desc", ObjectType = CustomObjectType.AriUnits, ObjectSubType = 2, ObjectJson = "{\"foo\":[1,5,7,10]}" });
        customObjectPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        customObjectPatchResponse = CustomObjectManager.UpdateCustomDataObject(Client, Data.CustomObjects[1].CustomDataObjectId, new CustomObjectPatchRequest { Description = "New Desc" });
        customObjectPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        customObjectGetResponse = CustomObjectManager.GetCustomDataObject(Client, Data.CustomObjects[1].CustomDataObjectId);
        customObjectGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        disputeCustomObjectsGetResponse = CustomObjectManager.GetDisputeCustomObjects(Client, Data.Dispute.DisputeGuid, new CustomObjectGetRequest { IsActive = true });
        disputeCustomObjectsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        customObjectDeleteResponse = CustomObjectManager.DeleteCustomDataObject(Client, Data.CustomObjects[0].CustomDataObjectId);
        customObjectDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}