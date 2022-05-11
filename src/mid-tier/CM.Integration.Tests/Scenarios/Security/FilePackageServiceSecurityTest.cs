using System.Net;
using CM.Business.Entities.Models.FilePackageService;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckFilePackageServiceSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);
        Client.SetDisputeGuidHeaderToken(Data.Dispute.DisputeGuid);

        var filePackageServicePostResponse = FilePackageServiceManager.CreateFilePackageService(Client, Data.FilePackage.FilePackageId, new FilePackageServiceRequest());
        filePackageServicePostResponse.CheckStatusCode();

        var filePackageServicePatchResponse = FilePackageServiceManager.UpdateFilePackageService(Client, Data.FilePackageServices[0].FilePackageServiceId, new FilePackageServicePatchRequest());
        filePackageServicePatchResponse.CheckStatusCode();

        var filePackageServiceDeleteResponse = FilePackageServiceManager.DeleteFilePackageService(Client, Data.FilePackageServices[0].FilePackageServiceId);
        filePackageServiceDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        filePackageServicePostResponse = FilePackageServiceManager.CreateFilePackageService(Client, Data.FilePackage.FilePackageId, new FilePackageServiceRequest());
        filePackageServicePostResponse.CheckStatusCode();

        filePackageServicePatchResponse = FilePackageServiceManager.UpdateFilePackageService(Client, Data.FilePackageServices[1].FilePackageServiceId, new FilePackageServicePatchRequest());
        filePackageServicePatchResponse.CheckStatusCode();

        filePackageServiceDeleteResponse = FilePackageServiceManager.DeleteFilePackageService(Client, Data.FilePackageServices[1].FilePackageServiceId);
        filePackageServiceDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // LOGIN AS UNAUTHORIZED EXTERNAL USER //
        Client.Authenticate(Users.User2, Users.User2);

        filePackageServicePostResponse = FilePackageServiceManager.CreateFilePackageService(Client, Data.FilePackage.FilePackageId, new FilePackageServiceRequest());
        filePackageServicePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        filePackageServicePatchResponse = FilePackageServiceManager.UpdateFilePackageService(Client, Data.FilePackageServices[2].FilePackageServiceId, new FilePackageServicePatchRequest());
        filePackageServicePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        filePackageServiceDeleteResponse = FilePackageServiceManager.DeleteFilePackageService(Client, Data.FilePackageServices[2].FilePackageServiceId);
        filePackageServiceDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        filePackageServicePostResponse = FilePackageServiceManager.CreateFilePackageService(Client, Data.FilePackage.FilePackageId, new FilePackageServiceRequest());
        filePackageServicePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        filePackageServicePatchResponse = FilePackageServiceManager.UpdateFilePackageService(Client, Data.FilePackageServices[3].FilePackageServiceId, new FilePackageServicePatchRequest());
        filePackageServicePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        filePackageServiceDeleteResponse = FilePackageServiceManager.DeleteFilePackageService(Client, Data.FilePackageServices[3].FilePackageServiceId);
        filePackageServiceDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        filePackageServicePostResponse = FilePackageServiceManager.CreateFilePackageService(Client, Data.FilePackage.FilePackageId, new FilePackageServiceRequest());
        filePackageServicePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        filePackageServicePatchResponse = FilePackageServiceManager.UpdateFilePackageService(Client, Data.FilePackageServices[4].FilePackageServiceId, new FilePackageServicePatchRequest());
        filePackageServicePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        filePackageServiceDeleteResponse = FilePackageServiceManager.DeleteFilePackageService(Client, Data.FilePackageServices[4].FilePackageServiceId);
        filePackageServiceDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}