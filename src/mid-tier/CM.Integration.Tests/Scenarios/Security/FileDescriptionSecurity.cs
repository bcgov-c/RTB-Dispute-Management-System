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
    public void CheckFileDescriptionSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        var fileDescriptionPostResponse = FileDescriptionManager.CreateFileDescription(Client, Data.Dispute.DisputeGuid, new FileDescriptionRequest());
        fileDescriptionPostResponse.CheckStatusCode();

        var fileDescriptionPatchResponse = FileDescriptionManager.UpdateFileDescription(Client, Data.FileDescriptions[0].FileDescriptionId, new FileDescriptionRequest());
        fileDescriptionPatchResponse.CheckStatusCode();

        var fileDescriptionDeleteResponse = FileDescriptionManager.DeleteFileDescription(Client, Data.FileDescriptions[0].FileDescriptionId);
        fileDescriptionDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var fileDescriptionGetResponse = FileDescriptionManager.GetFileDescription(Client, Data.FileDescriptions[5].FileDescriptionId);
        fileDescriptionGetResponse.CheckStatusCode();

        var fileDescriptionsGetResponse = FileDescriptionManager.GetDisputeFileDescriptions(Client, Data.Dispute.DisputeGuid);
        fileDescriptionsGetResponse.CheckStatusCode();

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        fileDescriptionPostResponse = FileDescriptionManager.CreateFileDescription(Client, Data.Dispute.DisputeGuid, new FileDescriptionRequest());
        fileDescriptionPostResponse.CheckStatusCode();

        fileDescriptionPatchResponse = FileDescriptionManager.UpdateFileDescription(Client, Data.FileDescriptions[1].FileDescriptionId, new FileDescriptionRequest());
        fileDescriptionPatchResponse.CheckStatusCode();

        fileDescriptionDeleteResponse = FileDescriptionManager.DeleteFileDescription(Client, Data.FileDescriptions[1].FileDescriptionId);
        fileDescriptionDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        fileDescriptionGetResponse = FileDescriptionManager.GetFileDescription(Client, Data.FileDescriptions[5].FileDescriptionId);
        fileDescriptionGetResponse.CheckStatusCode();

        fileDescriptionsGetResponse = FileDescriptionManager.GetDisputeFileDescriptions(Client, Data.Dispute.DisputeGuid);
        fileDescriptionsGetResponse.CheckStatusCode();

        // LOGIN AS UNAUTHORIZED EXTERNAL USER //
        Client.Authenticate(Users.User2, Users.User2);

        fileDescriptionPostResponse = FileDescriptionManager.CreateFileDescription(Client, Data.Dispute.DisputeGuid, new FileDescriptionRequest());
        fileDescriptionPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        fileDescriptionPatchResponse = FileDescriptionManager.UpdateFileDescription(Client, Data.FileDescriptions[2].FileDescriptionId, new FileDescriptionRequest());
        fileDescriptionPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        fileDescriptionDeleteResponse = FileDescriptionManager.DeleteFileDescription(Client, Data.FileDescriptions[2].FileDescriptionId);
        fileDescriptionDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        fileDescriptionGetResponse = FileDescriptionManager.GetFileDescription(Client, Data.FileDescriptions[5].FileDescriptionId);
        fileDescriptionGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        fileDescriptionsGetResponse = FileDescriptionManager.GetDisputeFileDescriptions(Client, Data.Dispute.DisputeGuid);
        fileDescriptionsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        fileDescriptionPostResponse = FileDescriptionManager.CreateFileDescription(Client, Data.Dispute.DisputeGuid, new FileDescriptionRequest());
        fileDescriptionPostResponse.CheckStatusCode();

        fileDescriptionPatchResponse = FileDescriptionManager.UpdateFileDescription(Client, Data.FileDescriptions[3].FileDescriptionId, new FileDescriptionRequest());
        fileDescriptionPatchResponse.CheckStatusCode();

        fileDescriptionDeleteResponse = FileDescriptionManager.DeleteFileDescription(Client, Data.FileDescriptions[3].FileDescriptionId);
        fileDescriptionDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        fileDescriptionGetResponse = FileDescriptionManager.GetFileDescription(Client, Data.FileDescriptions[5].FileDescriptionId);
        fileDescriptionGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        fileDescriptionsGetResponse = FileDescriptionManager.GetDisputeFileDescriptions(Client, Data.Dispute.DisputeGuid);
        fileDescriptionsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS UNAUTHORIZED ACCESSCODE
        auth = Client.Authenticate(Data.User2Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        fileDescriptionPatchResponse = FileDescriptionManager.UpdateFileDescription(Client, Data.FileDescriptions[4].FileDescriptionId, new FileDescriptionRequest());
        fileDescriptionPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        fileDescriptionPostResponse = FileDescriptionManager.CreateFileDescription(Client, Data.Dispute.DisputeGuid, new FileDescriptionRequest());
        fileDescriptionPostResponse.CheckStatusCode();

        fileDescriptionPatchResponse = FileDescriptionManager.UpdateFileDescription(Client, Data.FileDescriptions[5].FileDescriptionId, new FileDescriptionRequest());
        fileDescriptionPatchResponse.CheckStatusCode();

        fileDescriptionDeleteResponse = FileDescriptionManager.DeleteFileDescription(Client, Data.FileDescriptions[4].FileDescriptionId);
        fileDescriptionDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        fileDescriptionGetResponse = FileDescriptionManager.GetFileDescription(Client, Data.FileDescriptions[5].FileDescriptionId);
        fileDescriptionGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        fileDescriptionsGetResponse = FileDescriptionManager.GetDisputeFileDescriptions(Client, Data.Dispute.DisputeGuid);
        fileDescriptionsGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}