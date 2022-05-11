using System.Net;
using CM.Business.Entities.Models.Files;
using CM.Common.Utilities;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Theory]
    [InlineData(Users.Admin, Users.Admin, HttpStatusCode.OK)]
    [InlineData(Users.User, Users.User, HttpStatusCode.Unauthorized)]
    [InlineData(null, null, HttpStatusCode.Unauthorized)]
    [InlineData(Users.RemoteOffice, Users.RemoteOffice, HttpStatusCode.Unauthorized)]
    public void CheckCommonFileSecurity(string userName, string password, HttpStatusCode httpStatusCode)
    {
        if (userName == null)
        {
            var auth = Client.Authenticate(Data.Participant.AccessCode);
            Assert.True(auth.ResponseObject is string);
        }
        else
        {
            Client.Authenticate(userName, password);
        }

        var request = new FileRequest
        {
            FileName = "SampleSchedule_Jan2019",
            FileType = (byte)FileType.ExternalEvidence,
            FilePackageId = Data.FilePackage.FilePackageId
        };

        var commonFileResponse = CommonFileManager.CreateCommonFile(Client, request);
        commonFileResponse.ResponseMessage.StatusCode.Should().Be(httpStatusCode);

        var commonFilesGetResponse = CommonFileManager.GetCommonFiles(Client);
        commonFilesGetResponse.ResponseMessage.StatusCode.Should().Be(httpStatusCode);

        var commonFilePatchResponse = CommonFileManager.UpdateCommonFile(
            Client,
            Data.CommonFiles[0].CommonFileId,
            new CommonFilePatchRequest { FileTitle = "New Title" });
        commonFilePatchResponse.ResponseMessage.StatusCode.Should().Be(httpStatusCode);

        var commonFileDeleteResponse = CommonFileManager.DeleteCommonFile(Client, Data.CommonFiles[0].CommonFileId);
        commonFileDeleteResponse.StatusCode.Should().Be(httpStatusCode);
    }
}