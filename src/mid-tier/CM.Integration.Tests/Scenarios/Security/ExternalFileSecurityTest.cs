using System.Net;
using CM.Business.Entities.Models.ExternalCustomDataObject;
using CM.Business.Entities.Models.ExternalFile;
using CM.Common.Utilities;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckExternalFileSecurity()
    {
        var request = new ExternalFileRequest
        {
            FileName = "SampleSchedule_Jan2019",
            FileType = (byte)FileType.ExternalEvidence
        };

        // LOGIN AS STAFF
        var token = Client.Authenticate(Users.Admin, Users.Admin);

        var externalFilePostResponse = ExternalFileManager.CreateExternalFile(Client, Data.ExternalCustomDataObjects[7].ExternalCustomDataObjectId, request);
        externalFilePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        var externalFileGetByUrlResponse = ExternalFileManager.GetExternalFileByUrl(Client, externalFilePostResponse.ResponseObject.FileUrl, externalFilePostResponse.ResponseObject.ExternalFileId, token.ResponseObject);
        externalFileGetByUrlResponse.CheckStatusCode();

        var externalFilePatchResponse = ExternalFileManager.UpdateExternalFile(Client, Data.ExternalFiles[0].ExternalFileId, new ExternalFilePatchRequest() { FileTitle = "Changed Tile" });
        externalFilePatchResponse.CheckStatusCode();

        var externalFileDeleteResponse = ExternalFileManager.DeleteExternalFile(Client, Data.ExternalFiles[0].ExternalFileId);
        externalFileDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var externalFilesGetResponse = ExternalFileManager.GetExternalFiles(Client, Data.ExternalCustomDataObjects[7].ExternalCustomDataObjectId);
        externalFilesGetResponse.CheckStatusCode();

        var externalPdfResponse = ExternalFileManager.CreatePdfFromHtml(Client, Data.ExternalCustomDataObjects[7].ExternalCustomDataObjectId, new ExternalFileRequest());
        externalPdfResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        externalFilePostResponse = ExternalFileManager.CreateExternalFile(Client, Data.ExternalCustomDataObjects[7].ExternalCustomDataObjectId, request);
        externalFilePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        externalFilePatchResponse = ExternalFileManager.UpdateExternalFile(Client, Data.ExternalFiles[0].ExternalFileId, new ExternalFilePatchRequest() { FileTitle = "Changed Tile" });
        externalFilePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        externalFileDeleteResponse = ExternalFileManager.DeleteExternalFile(Client, Data.ExternalFiles[0].ExternalFileId);
        externalFileDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        externalFilesGetResponse = ExternalFileManager.GetExternalFiles(Client, Data.ExternalCustomDataObjects[7].ExternalCustomDataObjectId);
        externalFilesGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        externalPdfResponse = ExternalFileManager.CreatePdfFromHtml(Client, Data.ExternalCustomDataObjects[7].ExternalCustomDataObjectId, new ExternalFileRequest());
        externalPdfResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        externalFilePostResponse = ExternalFileManager.CreateExternalFile(Client, Data.ExternalCustomDataObjects[7].ExternalCustomDataObjectId, request);
        externalFilePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        externalFilePatchResponse = ExternalFileManager.UpdateExternalFile(Client, Data.ExternalFiles[0].ExternalFileId, new ExternalFilePatchRequest() { FileTitle = "Changed Tile" });
        externalFilePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        externalFileDeleteResponse = ExternalFileManager.DeleteExternalFile(Client, Data.ExternalFiles[0].ExternalFileId);
        externalFileDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        externalFilesGetResponse = ExternalFileManager.GetExternalFiles(Client, Data.ExternalCustomDataObjects[7].ExternalCustomDataObjectId);
        externalFilesGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        externalPdfResponse = ExternalFileManager.CreatePdfFromHtml(Client, Data.ExternalCustomDataObjects[7].ExternalCustomDataObjectId, new ExternalFileRequest());
        externalPdfResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        externalFilePostResponse = ExternalFileManager.CreateExternalFile(Client, Data.ExternalCustomDataObjects[7].ExternalCustomDataObjectId, request);
        externalFilePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        externalFilePatchResponse = ExternalFileManager.UpdateExternalFile(Client, Data.ExternalFiles[0].ExternalFileId, new ExternalFilePatchRequest() { FileTitle = "Changed Tile" });
        externalFilePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        externalFileDeleteResponse = ExternalFileManager.DeleteExternalFile(Client, Data.ExternalFiles[0].ExternalFileId);
        externalFileDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        externalFilesGetResponse = ExternalFileManager.GetExternalFiles(Client, Data.ExternalCustomDataObjects[7].ExternalCustomDataObjectId);
        externalFilesGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        externalPdfResponse = ExternalFileManager.CreatePdfFromHtml(Client, Data.ExternalCustomDataObjects[7].ExternalCustomDataObjectId, new ExternalFileRequest());
        externalPdfResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // One time token
        var ottToken = ExternalFileManager.CreateToken();

        var externalCustomDataObjectPostResponse = ExternalCustomDataObjectManager.CreateExternalCustomDataObject(Client, ottToken, new ExternalCustomDataObjectRequest() { Description = "Test Desc", Status = 1, SubType = 1, Title = "Test Title", Type = ExternalCustomObjectType.AriUnits });
        externalCustomDataObjectPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);
        var externalCustomDataObjectId = externalCustomDataObjectPostResponse.ResponseObject.ExternalCustomDataObjectId;

        externalFilePostResponse = ExternalFileManager.CreateExternalFile(Client, ottToken, externalCustomDataObjectId, request);
        externalFilePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        externalFilePatchResponse = ExternalFileManager.UpdateExternalFile(Client, ottToken, externalFilePostResponse.ResponseObject.ExternalFileId, new ExternalFilePatchRequest() { FileTitle = "Changed Tile" });
        externalFilePatchResponse.CheckStatusCode();

        externalFileDeleteResponse = ExternalFileManager.DeleteExternalFile(Client, ottToken, externalFilePostResponse.ResponseObject.ExternalFileId);
        externalFileDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        externalPdfResponse = ExternalFileManager.CreatePdfFromHtml(Client, ottToken, externalCustomDataObjectId, new ExternalFileRequest());
        externalPdfResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        ottToken = ExternalFileManager.CreateToken();

        externalFilePatchResponse = ExternalFileManager.UpdateExternalFile(Client, ottToken, Data.ExternalFiles[1].ExternalFileId, new ExternalFilePatchRequest() { FileTitle = "Changed Tile" });
        externalFilePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        externalFileDeleteResponse = ExternalFileManager.DeleteExternalFile(Client, ottToken, Data.ExternalFiles[1].ExternalFileId);
        externalFileDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        externalPdfResponse = ExternalFileManager.CreatePdfFromHtml(Client, ottToken, Data.ExternalCustomDataObjects[7].ExternalCustomDataObjectId, new ExternalFileRequest());
        externalPdfResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        ottToken = ExternalFileManager.CreateToken();
        ottToken += "Failed";

        externalFilePostResponse = ExternalFileManager.CreateExternalFile(Client, ottToken, Data.ExternalCustomDataObjects[7].ExternalCustomDataObjectId, request);
        externalFilePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}