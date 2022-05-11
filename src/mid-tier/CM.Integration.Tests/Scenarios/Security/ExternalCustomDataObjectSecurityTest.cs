using System.Net;
using CM.Business.Entities.Models.ExternalCustomDataObject;
using CM.Common.Utilities;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckExternalCustomDataObjectSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        var externalCustomDataObjectPostResponse = ExternalCustomDataObjectManager.CreateExternalCustomDataObject(Client, new ExternalCustomDataObjectRequest() { Description = "Test Desc", Status = 1, SubType = 1, Title = "Test Title", Type = ExternalCustomObjectType.AriUnits });
        externalCustomDataObjectPostResponse.CheckStatusCode();

        var externalCustomDataObjectPatchResponse = ExternalCustomDataObjectManager.UpdateExternalCustomDataObject(Client, Data.ExternalCustomDataObjects[0].ExternalCustomDataObjectId, new ExternalCustomObjectPatchRequest() { Title = "Changed Title" });
        externalCustomDataObjectPatchResponse.CheckStatusCode();

        var externalCustomDataObjectDeleteResponse = ExternalCustomDataObjectManager.DeleteExternalCustomDataObject(Client, Data.ExternalCustomDataObjects[0].ExternalCustomDataObjectId);
        externalCustomDataObjectDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var externalCustomDataObjectGetResponse = ExternalCustomDataObjectManager.GetExternalCustomDataObject(Client, Data.ExternalCustomDataObjects[5].ExternalCustomDataObjectId);
        externalCustomDataObjectGetResponse.CheckStatusCode();

        var externalCustomDataObjectsGetResponse = ExternalCustomDataObjectManager.GetExternalCustomDataObjects(Client);
        externalCustomDataObjectsGetResponse.CheckStatusCode();

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        externalCustomDataObjectPostResponse = ExternalCustomDataObjectManager.CreateExternalCustomDataObject(Client, new ExternalCustomDataObjectRequest() { Description = "Test Desc", Status = 1, SubType = 1, Title = "Test Title", Type = ExternalCustomObjectType.AriUnits });
        externalCustomDataObjectPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        externalCustomDataObjectPatchResponse = ExternalCustomDataObjectManager.UpdateExternalCustomDataObject(Client, Data.ExternalCustomDataObjects[1].ExternalCustomDataObjectId, new ExternalCustomObjectPatchRequest() { Title = "Changed Title" });
        externalCustomDataObjectPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        externalCustomDataObjectDeleteResponse = ExternalCustomDataObjectManager.DeleteExternalCustomDataObject(Client, Data.ExternalCustomDataObjects[1].ExternalCustomDataObjectId);
        externalCustomDataObjectDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        externalCustomDataObjectGetResponse = ExternalCustomDataObjectManager.GetExternalCustomDataObject(Client, Data.ExternalCustomDataObjects[5].ExternalCustomDataObjectId);
        externalCustomDataObjectGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        externalCustomDataObjectsGetResponse = ExternalCustomDataObjectManager.GetExternalCustomDataObjects(Client);
        externalCustomDataObjectsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        externalCustomDataObjectPostResponse = ExternalCustomDataObjectManager.CreateExternalCustomDataObject(Client, new ExternalCustomDataObjectRequest() { Description = "Test Desc", Status = 1, SubType = 1, Title = "Test Title", Type = ExternalCustomObjectType.AriUnits });
        externalCustomDataObjectPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        externalCustomDataObjectPatchResponse = ExternalCustomDataObjectManager.UpdateExternalCustomDataObject(Client, Data.ExternalCustomDataObjects[2].ExternalCustomDataObjectId, new ExternalCustomObjectPatchRequest() { Title = "Changed Title" });
        externalCustomDataObjectPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        externalCustomDataObjectDeleteResponse = ExternalCustomDataObjectManager.DeleteExternalCustomDataObject(Client, Data.ExternalCustomDataObjects[2].ExternalCustomDataObjectId);
        externalCustomDataObjectDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        externalCustomDataObjectGetResponse = ExternalCustomDataObjectManager.GetExternalCustomDataObject(Client, Data.ExternalCustomDataObjects[5].ExternalCustomDataObjectId);
        externalCustomDataObjectGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        externalCustomDataObjectsGetResponse = ExternalCustomDataObjectManager.GetExternalCustomDataObjects(Client);
        externalCustomDataObjectsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        externalCustomDataObjectPostResponse = ExternalCustomDataObjectManager.CreateExternalCustomDataObject(Client, new ExternalCustomDataObjectRequest() { Description = "Test Desc", Status = 1, SubType = 1, Title = "Test Title", Type = ExternalCustomObjectType.AriUnits });
        externalCustomDataObjectPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        externalCustomDataObjectPatchResponse = ExternalCustomDataObjectManager.UpdateExternalCustomDataObject(Client, Data.ExternalCustomDataObjects[3].ExternalCustomDataObjectId, new ExternalCustomObjectPatchRequest() { Title = "Changed Title" });
        externalCustomDataObjectPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        externalCustomDataObjectDeleteResponse = ExternalCustomDataObjectManager.DeleteExternalCustomDataObject(Client, Data.ExternalCustomDataObjects[3].ExternalCustomDataObjectId);
        externalCustomDataObjectDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        externalCustomDataObjectGetResponse = ExternalCustomDataObjectManager.GetExternalCustomDataObject(Client, Data.ExternalCustomDataObjects[5].ExternalCustomDataObjectId);
        externalCustomDataObjectGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        externalCustomDataObjectsGetResponse = ExternalCustomDataObjectManager.GetExternalCustomDataObjects(Client);
        externalCustomDataObjectsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // One time token
        var token = ExternalCustomDataObjectManager.CreateToken();

        externalCustomDataObjectPostResponse = ExternalCustomDataObjectManager.CreateExternalCustomDataObject(Client, token, new ExternalCustomDataObjectRequest() { Description = "Test Desc", Status = 1, SubType = 1, Title = "Test Title", Type = ExternalCustomObjectType.AriUnits });
        externalCustomDataObjectPostResponse.CheckStatusCode();

        externalCustomDataObjectPatchResponse = ExternalCustomDataObjectManager.UpdateExternalCustomDataObject(Client, token, externalCustomDataObjectPostResponse.ResponseObject.ExternalCustomDataObjectId, new ExternalCustomObjectPatchRequest() { Title = "Changed Title" });
        externalCustomDataObjectPatchResponse.CheckStatusCode();

        externalCustomDataObjectDeleteResponse = ExternalCustomDataObjectManager.DeleteExternalCustomDataObject(Client, token, externalCustomDataObjectPostResponse.ResponseObject.ExternalCustomDataObjectId);
        externalCustomDataObjectDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        externalCustomDataObjectPostResponse = ExternalCustomDataObjectManager.CreateExternalCustomDataObject(Client, token, new ExternalCustomDataObjectRequest() { Description = "Test Desc", Status = 1, SubType = 1, Title = "Test Title", Type = ExternalCustomObjectType.AriUnits });
        externalCustomDataObjectPostResponse.CheckStatusCode();

        externalCustomDataObjectPostResponse = ExternalCustomDataObjectManager.CreateExternalCustomDataObject(Client, token, new ExternalCustomDataObjectRequest() { Description = "Test Desc", Status = 1, SubType = 1, Title = "Test Title", Type = ExternalCustomObjectType.AriUnits });
        externalCustomDataObjectPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        token = ExternalCustomDataObjectManager.CreateToken();

        externalCustomDataObjectPatchResponse = ExternalCustomDataObjectManager.UpdateExternalCustomDataObject(Client, token, Data.ExternalCustomDataObjects[5].ExternalCustomDataObjectId, new ExternalCustomObjectPatchRequest() { Title = "Changed Title" });
        externalCustomDataObjectPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        externalCustomDataObjectDeleteResponse = ExternalCustomDataObjectManager.DeleteExternalCustomDataObject(Client, token, Data.ExternalCustomDataObjects[5].ExternalCustomDataObjectId);
        externalCustomDataObjectDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        token = ExternalCustomDataObjectManager.CreateToken();
        token += "Failed";
        externalCustomDataObjectPostResponse = ExternalCustomDataObjectManager.CreateExternalCustomDataObject(Client, token, new ExternalCustomDataObjectRequest() { Description = "Test Desc", Status = 1, SubType = 1, Title = "Test Title", Type = ExternalCustomObjectType.AriUnits });
        externalCustomDataObjectPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}