using System.Net;
using CM.Business.Entities.Models.CustomConfigObject;
using CM.Common.Utilities;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security
{
    public partial class SecurityTests
    {
        [Fact]
        public void CheckCustomConfigObjectSecurity()
        {
            // LOGIN AS STAFF
            Client.Authenticate(Users.Admin, Users.Admin);

            var customConfigObjectPostResponse = CustomConfigObjectManager.CreateCustomConfigObject(Client, new CustomConfigObjectPostRequest() { ObjectType = 1, ObjectTitle = "Test Title", IsActive = true, IsPublic = true, ObjectStorageType = (byte)CustomObjectStorageType.Text, ObjectText = "Test Object Text" });
            customConfigObjectPostResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

            var customConfigObjectPatchResponse = CustomConfigObjectManager.UpdateCustomConfigObject(Client, Data.CustomConfigObjects[0].CustomConfigObjectId, new CustomConfigObjectPatchRequest() { ObjectTitle = "Changed Object Title" });
            customConfigObjectPatchResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

            var customConfigObjectGetResponse = CustomConfigObjectManager.GetCustomConfigObject(Client, Data.CustomConfigObjects[0].CustomConfigObjectId);
            customConfigObjectGetResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

            var publicCustomConfigObjectsGetResponse = CustomConfigObjectManager.GetPublicCustomConfigObjects(Client, new CustomConfigObjectGetRequest() { RequestActiveOnly = true });
            publicCustomConfigObjectsGetResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

            var privateCustomConfigObjectsGetResponse = CustomConfigObjectManager.GetPrivateCustomConfigObjects(Client, new CustomConfigObjectGetRequest() { RequestActiveOnly = true });
            privateCustomConfigObjectsGetResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

            var customConfigObjectDeleteResponse = CustomConfigObjectManager.DeleteCustomConfigObject(Client, Data.CustomConfigObjects[2].CustomConfigObjectId);
            customConfigObjectDeleteResponse.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

            // LOGIN AS EXTERNAL
            Client.Authenticate(Users.User, Users.User);

            customConfigObjectPostResponse = CustomConfigObjectManager.CreateCustomConfigObject(Client, new CustomConfigObjectPostRequest() { ObjectType = 1, ObjectTitle = "Test Title", IsActive = true, IsPublic = true, ObjectStorageType = (byte)CustomObjectStorageType.Text, ObjectText = "Test Object Text" });
            customConfigObjectPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            customConfigObjectPatchResponse = CustomConfigObjectManager.UpdateCustomConfigObject(Client, Data.CustomConfigObjects[0].CustomConfigObjectId, new CustomConfigObjectPatchRequest() { ObjectTitle = "Changed Object Title" });
            customConfigObjectPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            customConfigObjectGetResponse = CustomConfigObjectManager.GetCustomConfigObject(Client, Data.CustomConfigObjects[0].CustomConfigObjectId);
            customConfigObjectGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            publicCustomConfigObjectsGetResponse = CustomConfigObjectManager.GetPublicCustomConfigObjects(Client, new CustomConfigObjectGetRequest() { RequestActiveOnly = true });
            publicCustomConfigObjectsGetResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

            privateCustomConfigObjectsGetResponse = CustomConfigObjectManager.GetPrivateCustomConfigObjects(Client, new CustomConfigObjectGetRequest() { RequestActiveOnly = true });
            privateCustomConfigObjectsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            customConfigObjectDeleteResponse = CustomConfigObjectManager.DeleteCustomConfigObject(Client, Data.CustomConfigObjects[2].CustomConfigObjectId);
            customConfigObjectDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            // LOGIN AS ACCESSCODE
            var auth = Client.Authenticate(Data.Participant.AccessCode);
            Assert.True(auth.ResponseObject is string);

            customConfigObjectPostResponse = CustomConfigObjectManager.CreateCustomConfigObject(Client, new CustomConfigObjectPostRequest() { ObjectType = 1, ObjectTitle = "Test Title", IsActive = true, IsPublic = true, ObjectStorageType = (byte)CustomObjectStorageType.Text, ObjectText = "Test Object Text" });
            customConfigObjectPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            customConfigObjectPatchResponse = CustomConfigObjectManager.UpdateCustomConfigObject(Client, Data.CustomConfigObjects[0].CustomConfigObjectId, new CustomConfigObjectPatchRequest() { ObjectTitle = "Changed Object Title" });
            customConfigObjectPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            customConfigObjectGetResponse = CustomConfigObjectManager.GetCustomConfigObject(Client, Data.CustomConfigObjects[0].CustomConfigObjectId);
            customConfigObjectGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            publicCustomConfigObjectsGetResponse = CustomConfigObjectManager.GetPublicCustomConfigObjects(Client, new CustomConfigObjectGetRequest() { RequestActiveOnly = true });
            publicCustomConfigObjectsGetResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

            privateCustomConfigObjectsGetResponse = CustomConfigObjectManager.GetPrivateCustomConfigObjects(Client, new CustomConfigObjectGetRequest() { RequestActiveOnly = true });
            privateCustomConfigObjectsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            customConfigObjectDeleteResponse = CustomConfigObjectManager.DeleteCustomConfigObject(Client, Data.CustomConfigObjects[2].CustomConfigObjectId);
            customConfigObjectDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            // LOGIN AS OFFICE PAY
            Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

            customConfigObjectPostResponse = CustomConfigObjectManager.CreateCustomConfigObject(Client, new CustomConfigObjectPostRequest() { ObjectType = 1, ObjectTitle = "Test Title", IsActive = true, IsPublic = true, ObjectStorageType = (byte)CustomObjectStorageType.Text, ObjectText = "Test Object Text" });
            customConfigObjectPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            customConfigObjectPatchResponse = CustomConfigObjectManager.UpdateCustomConfigObject(Client, Data.CustomConfigObjects[0].CustomConfigObjectId, new CustomConfigObjectPatchRequest() { ObjectTitle = "Changed Object Title" });
            customConfigObjectPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            customConfigObjectGetResponse = CustomConfigObjectManager.GetCustomConfigObject(Client, Data.CustomConfigObjects[0].CustomConfigObjectId);
            customConfigObjectGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            publicCustomConfigObjectsGetResponse = CustomConfigObjectManager.GetPublicCustomConfigObjects(Client, new CustomConfigObjectGetRequest() { RequestActiveOnly = true });
            publicCustomConfigObjectsGetResponse.ResponseMessage.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);

            privateCustomConfigObjectsGetResponse = CustomConfigObjectManager.GetPrivateCustomConfigObjects(Client, new CustomConfigObjectGetRequest() { RequestActiveOnly = true });
            privateCustomConfigObjectsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

            customConfigObjectDeleteResponse = CustomConfigObjectManager.DeleteCustomConfigObject(Client, Data.CustomConfigObjects[2].CustomConfigObjectId);
            customConfigObjectDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }
    }
}