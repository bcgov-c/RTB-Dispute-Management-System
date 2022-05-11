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
    public void CheckFilePackageSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        var filePackagePostResponse = FilePackageManager.CreateFilePackage(Client, Data.Dispute.DisputeGuid, new FilePackageRequest());
        filePackagePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var filePackagePatchResponse = FilePackageManager.UpdateFilePackage(Client, Data.FilePackages[0].FilePackageId, new FilePackagePatchRequest());
        filePackagePatchResponse.CheckStatusCode();

        var filePackageDeleteResponse = FilePackageManager.DeleteFilePackage(Client, Data.FilePackages[0].FilePackageId);
        filePackageDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var filePackageGetResponse = FilePackageManager.GetFilePackage(Client, Data.FilePackage.FilePackageId);
        filePackageGetResponse.CheckStatusCode();

        var disputeFilePackageGetResponse = FilePackageManager.GetDisputeFilePackages(Client, Data.Dispute.DisputeGuid);
        disputeFilePackageGetResponse.CheckStatusCode();

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        filePackagePostResponse = FilePackageManager.CreateFilePackage(Client, Data.Dispute.DisputeGuid, new FilePackageRequest());
        filePackagePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        filePackagePatchResponse = FilePackageManager.UpdateFilePackage(Client, Data.FilePackages[1].FilePackageId, new FilePackagePatchRequest());
        filePackagePatchResponse.CheckStatusCode();

        filePackageDeleteResponse = FilePackageManager.DeleteFilePackage(Client, Data.FilePackages[1].FilePackageId);
        filePackageDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        filePackageGetResponse = FilePackageManager.GetFilePackage(Client, Data.FilePackage.FilePackageId);
        filePackageGetResponse.CheckStatusCode();

        disputeFilePackageGetResponse = FilePackageManager.GetDisputeFilePackages(Client, Data.Dispute.DisputeGuid);
        disputeFilePackageGetResponse.CheckStatusCode();

        // LOGIN AS UNAUTHORIZED EXTERNAL USER //
        Client.Authenticate(Users.User2, Users.User2);

        filePackagePostResponse = FilePackageManager.CreateFilePackage(Client, Data.Dispute.DisputeGuid, new FilePackageRequest());
        filePackagePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        filePackagePatchResponse = FilePackageManager.UpdateFilePackage(Client, Data.FilePackages[2].FilePackageId, new FilePackagePatchRequest());
        filePackagePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        filePackageDeleteResponse = FilePackageManager.DeleteFilePackage(Client, Data.FilePackages[2].FilePackageId);
        filePackageDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        filePackageGetResponse = FilePackageManager.GetFilePackage(Client, Data.FilePackage.FilePackageId);
        filePackageGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeFilePackageGetResponse = FilePackageManager.GetDisputeFilePackages(Client, Data.Dispute.DisputeGuid);
        disputeFilePackageGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        filePackagePostResponse = FilePackageManager.CreateFilePackage(Client, Data.Dispute.DisputeGuid, new FilePackageRequest());
        filePackagePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        filePackagePatchResponse = FilePackageManager.UpdateFilePackage(Client, Data.FilePackages[3].FilePackageId, new FilePackagePatchRequest());
        filePackagePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        filePackageDeleteResponse = FilePackageManager.DeleteFilePackage(Client, Data.FilePackages[3].FilePackageId);
        filePackageDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        filePackageGetResponse = FilePackageManager.GetFilePackage(Client, Data.FilePackage.FilePackageId);
        filePackageGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeFilePackageGetResponse = FilePackageManager.GetDisputeFilePackages(Client, Data.Dispute.DisputeGuid);
        disputeFilePackageGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS UNAUTHORIZED ACCESSCODE
        auth = Client.Authenticate(Data.User2Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        filePackagePostResponse = FilePackageManager.CreateFilePackage(Client, Data.Dispute.DisputeGuid, new FilePackageRequest());
        filePackagePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        filePackagePostResponse = FilePackageManager.CreateFilePackage(Client, Data.Dispute.DisputeGuid, new FilePackageRequest());
        filePackagePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        filePackagePatchResponse = FilePackageManager.UpdateFilePackage(Client, Data.FilePackages[4].FilePackageId, new FilePackagePatchRequest());
        filePackagePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        filePackageDeleteResponse = FilePackageManager.DeleteFilePackage(Client, Data.FilePackages[4].FilePackageId);
        filePackageDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        filePackageGetResponse = FilePackageManager.GetFilePackage(Client, Data.FilePackage.FilePackageId);
        filePackageGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeFilePackageGetResponse = FilePackageManager.GetDisputeFilePackages(Client, Data.Dispute.DisputeGuid);
        disputeFilePackageGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}