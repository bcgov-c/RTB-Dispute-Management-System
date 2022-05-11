using System.Net;
using CM.Business.Entities.Models.ExternalCustomDataObject;
using CM.Business.Entities.Models.ExternalFile;
using CM.Common.Utilities;
using CM.Integration.Tests.Helpers;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Integration;

public partial class IntegrationTests
{
    [Fact]
    public void ExternalFile()
    {
        var request = new ExternalFileRequest
        {
            FileName = "SampleSchedule_Jan2019",
            FileType = (byte)FileType.ExternalEvidence
        };

        var ottToken = ExternalFileManager.CreateToken();

        var externalCustomDataObjectPostResponse = ExternalCustomDataObjectManager.CreateExternalCustomDataObject(Client, ottToken, new ExternalCustomDataObjectRequest() { Description = "Test Desc", Status = 1, SubType = 1, Title = "Test Title", Type = ExternalCustomObjectType.AriUnits });
        externalCustomDataObjectPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);
        var externalCustomDataObjectId = externalCustomDataObjectPostResponse.ResponseObject.ExternalCustomDataObjectId;

        var externalFilePostResponse = ExternalFileManager.CreateExternalFile(Client, ottToken, externalCustomDataObjectId, request);
        externalFilePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        var externalFilePatchResponse = ExternalFileManager.UpdateExternalFile(Client, ottToken, externalFilePostResponse.ResponseObject.ExternalFileId, new ExternalFilePatchRequest() { FileTitle = "Changed Tile" });
        externalFilePatchResponse.CheckStatusCode();

        var externalFileDeleteResponse = ExternalFileManager.DeleteExternalFile(Client, ottToken, externalFilePostResponse.ResponseObject.ExternalFileId);
        externalFileDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var externalPdfResponse = ExternalFileManager.CreatePdfFromHtml(Client, ottToken, externalCustomDataObjectId, new ExternalFileRequest());
        externalPdfResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}