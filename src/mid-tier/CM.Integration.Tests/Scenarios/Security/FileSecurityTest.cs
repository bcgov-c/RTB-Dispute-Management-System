using System.Net;
using CM.Business.Entities.Models.Files;
using CM.Business.Entities.Models.OutcomeDocument;
using CM.Common.Utilities;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckFileSecurity()
    {
        var request = new FileRequest
        {
            FileName = "SampleSchedule_Jan2019",
            FileType = (byte)FileType.ExternalEvidence,
            FilePackageId = Data.FilePackage.FilePackageId
        };

        var requestFileType2 = new FileRequest
        {
            FileName = "SampleSchedule_Jan2019",
            FileType = (byte)FileType.Notice,
            FilePackageId = Data.FilePackage.FilePackageId
        };

        // LOGIN AS STAFF
        var token = Client.Authenticate(Users.Admin, Users.Admin);
        Client.SetDisputeGuidHeaderToken(Data.Dispute.DisputeGuid);

        var fileResponse = FileManager.CreateFile(Client, Data.Dispute.DisputeGuid, request);
        fileResponse.CheckStatusCode();

        var fileDeleteResponse = FileManager.DeleteFile(Client, Data.Files[0].FileId);
        fileDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var fileGetResponse = FileManager.GetFile(Client, Data.Files[5].FileUrl, Data.Files[5].FileId, token.ResponseObject);
        fileGetResponse.CheckStatusCode();

        var pdfResponse = FileManager.CreatePdfFromHtml(Client, Data.Dispute.DisputeGuid, new PdfFileRequest());
        pdfResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        // LOGIN AS EXTERNAL
        token = Client.Authenticate(Users.User, Users.User);

        fileResponse = FileManager.CreateFile(Client, Data.Dispute.DisputeGuid, request);
        fileResponse.CheckStatusCode();

        fileDeleteResponse = FileManager.DeleteFile(Client, Data.Files[1].FileId);
        fileDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        fileGetResponse = FileManager.GetFile(Client, Data.Files[5].FileUrl, Data.Files[5].FileId, token.ResponseObject);
        fileGetResponse.CheckStatusCode();

        pdfResponse = FileManager.CreatePdfFromHtml(Client, Data.Dispute.DisputeGuid, new PdfFileRequest());
        pdfResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        // LOGIN AS UNAUTHORIZED EXTERNAL USER //
        token = Client.Authenticate(Users.User2, Users.User2);

        fileResponse = FileManager.CreateFile(Client, Data.Dispute.DisputeGuid, request);
        fileResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        fileDeleteResponse = FileManager.DeleteFile(Client, Data.Files[2].FileId);
        fileDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        fileGetResponse = FileManager.GetFile(Client, Data.Files[5].FileUrl, Data.Files[5].FileId, token.ResponseObject);
        fileGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        pdfResponse = FileManager.CreatePdfFromHtml(Client, Data.Dispute.DisputeGuid, new PdfFileRequest());
        pdfResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        fileResponse = FileManager.CreateFile(Client, Data.Dispute.DisputeGuid, requestFileType2);
        fileResponse.CheckStatusCode();

        fileDeleteResponse = FileManager.DeleteFile(Client, fileResponse.ResponseObject.FileId);
        fileDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        token = new Infrastructure.EntityWithStatus<string> { ResponseMessage = auth.ResponseMessage, ResponseObject = auth.ResponseObject.ToString() };
        fileGetResponse = FileManager.GetFile(Client, Data.Files[5].FileUrl, Data.Files[5].FileId, token.ResponseObject);
        fileGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        pdfResponse = FileManager.CreatePdfFromHtml(Client, Data.Dispute.DisputeGuid, new PdfFileRequest());
        pdfResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        // LOGIN AS OFFICE PAY
        token = Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        fileResponse = FileManager.CreateFile(Client, Data.Dispute.DisputeGuid, request);
        fileResponse.CheckStatusCode();

        fileDeleteResponse = FileManager.DeleteFile(Client, fileResponse.ResponseObject.FileId);
        fileDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        fileDeleteResponse = FileManager.DeleteFile(Client, Data.Files[4].FileId);
        fileDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        fileGetResponse = FileManager.GetFile(Client, Data.Files[5].FileUrl, Data.Files[5].FileId, token.ResponseObject);
        fileGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        pdfResponse = FileManager.CreatePdfFromHtml(Client, Data.Dispute.DisputeGuid, new PdfFileRequest());
        pdfResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        // PublicAccessAllowed case
        Client.Authenticate(Users.Admin, Users.Admin);

        var newFile = FileManager.CreatePdfFile(Client,
            Data.Dispute.DisputeGuid,
            new FileRequest
            {
                DisputeGuid = Data.Dispute.DisputeGuid,
                FileType = (byte)FileType.AnonymousExternalDocument,
                FileName = "Other_Public_File"
            });

        var outcomeDocFile = OutcomeDocFileManager.CreateOutcomeDocFile(Client,
            Data.OutcomeDocGroups[0].OutcomeDocGroupId,
            new OutcomeDocFilePostRequest
            {
                FileId = newFile.ResponseObject.FileId,
                DisputeGuid = Data.Dispute.DisputeGuid,
                FileType = (byte)OutcomeDocFileTypes.PublicDecision
            });
        OutcomeDocFileManager.UpdateOutcomeDocFile(Client,
            outcomeDocFile.ResponseObject.OutcomeDocFileId,
            new OutcomeDocFilePatchRequest { VisibleToPublic = true, FileId = newFile.ResponseObject.FileId });

        UserManager.Logout(Client);
        fileGetResponse = FileManager.GetFile(Client, newFile.ResponseObject.FileUrl, newFile.ResponseObject.FileId, null);
        fileGetResponse.CheckStatusCode();
    }
}