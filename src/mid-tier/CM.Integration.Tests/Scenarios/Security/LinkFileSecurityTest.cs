using System.Net;
using CM.Business.Entities.Models.Files;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckLinkFileSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        var linkFilePostResponse = LinkFileManager.CreateLinkFile(Client, Data.Dispute.DisputeGuid, new LinkedFileRequest { FileDescriptionId = Data.FileDescriptions[5].FileDescriptionId, FileId = Data.Files[5].FileId });
        linkFilePostResponse.CheckStatusCode();

        var linkFileDeleteResponse = LinkFileManager.DeleteLinkFile(Client, Data.LinkFiles[0].LinkedFileId);
        linkFileDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var disputeLinkedFilesGetResponse = LinkFileManager.GetDisputeLinkFiles(Client, Data.Dispute.DisputeGuid);
        disputeLinkedFilesGetResponse.CheckStatusCode();

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        linkFilePostResponse = LinkFileManager.CreateLinkFile(Client, Data.Dispute.DisputeGuid, new LinkedFileRequest { FileDescriptionId = Data.FileDescriptions[5].FileDescriptionId, FileId = Data.Files[5].FileId });
        linkFilePostResponse.CheckStatusCode();

        linkFileDeleteResponse = LinkFileManager.DeleteLinkFile(Client, Data.LinkFiles[1].LinkedFileId);
        linkFileDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        disputeLinkedFilesGetResponse = LinkFileManager.GetDisputeLinkFiles(Client, Data.Dispute.DisputeGuid);
        disputeLinkedFilesGetResponse.CheckStatusCode();

        // LOGIN AS UNAUTHORIZED EXTERNAL USER //
        Client.Authenticate(Users.User2, Users.User2);

        linkFilePostResponse = LinkFileManager.CreateLinkFile(Client, Data.Dispute.DisputeGuid, new LinkedFileRequest { FileDescriptionId = Data.FileDescriptions[5].FileDescriptionId, FileId = Data.Files[5].FileId });
        linkFilePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        linkFileDeleteResponse = LinkFileManager.DeleteLinkFile(Client, Data.LinkFiles[2].LinkedFileId);
        linkFileDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeLinkedFilesGetResponse = LinkFileManager.GetDisputeLinkFiles(Client, Data.Dispute.DisputeGuid);
        disputeLinkedFilesGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        linkFilePostResponse = LinkFileManager.CreateLinkFile(Client, Data.Dispute.DisputeGuid, new LinkedFileRequest { FileDescriptionId = Data.FileDescriptions[5].FileDescriptionId, FileId = Data.Files[5].FileId });
        linkFilePostResponse.CheckStatusCode();

        linkFileDeleteResponse = LinkFileManager.DeleteLinkFile(Client, Data.LinkFiles[3].LinkedFileId);
        linkFileDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeLinkedFilesGetResponse = LinkFileManager.GetDisputeLinkFiles(Client, Data.Dispute.DisputeGuid);
        disputeLinkedFilesGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS UNAUTHORIZED ACCESSCODE
        auth = Client.Authenticate(Data.User2Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        linkFilePostResponse = LinkFileManager.CreateLinkFile(Client, Data.Dispute.DisputeGuid, new LinkedFileRequest { FileDescriptionId = Data.FileDescriptions[5].FileDescriptionId, FileId = Data.Files[5].FileId });
        linkFilePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        linkFilePostResponse = LinkFileManager.CreateLinkFile(Client, Data.Dispute.DisputeGuid, new LinkedFileRequest { FileDescriptionId = Data.FileDescriptions[5].FileDescriptionId, FileId = Data.Files[5].FileId });
        linkFilePostResponse.CheckStatusCode();

        linkFileDeleteResponse = LinkFileManager.DeleteLinkFile(Client, Data.LinkFiles[4].LinkedFileId);
        linkFileDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeLinkedFilesGetResponse = LinkFileManager.GetDisputeLinkFiles(Client, Data.Dispute.DisputeGuid);
        disputeLinkedFilesGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}