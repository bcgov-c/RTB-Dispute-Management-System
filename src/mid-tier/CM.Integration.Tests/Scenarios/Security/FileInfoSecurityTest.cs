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
    public void CheckFileInfoSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);
        Client.SetDisputeGuidHeaderToken(Data.Dispute.DisputeGuid);

        var fileInfoResponse = FileInfoManager.GetFileInfo(Client, Data.Files[5].FileId);
        fileInfoResponse.CheckStatusCode();

        var disputeFileInfoResponse = FileInfoManager.GetDisputeFileInfos(Client, Data.Dispute.DisputeGuid);
        disputeFileInfoResponse.CheckStatusCode();

        var fileInfoPatchResponse = FileInfoManager.UpdateFileInfo(Client, Data.Files[5].FileId, new FileInfoPatchRequest());
        fileInfoPatchResponse.CheckStatusCode();

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        fileInfoResponse = FileInfoManager.GetFileInfo(Client, Data.Files[5].FileId);
        fileInfoResponse.CheckStatusCode();

        disputeFileInfoResponse = FileInfoManager.GetDisputeFileInfos(Client, Data.Dispute.DisputeGuid);
        disputeFileInfoResponse.CheckStatusCode();

        fileInfoPatchResponse = FileInfoManager.UpdateFileInfo(Client, Data.Files[5].FileId, new FileInfoPatchRequest());
        fileInfoPatchResponse.CheckStatusCode();

        // LOGIN AS UNAUTHORIZED EXTERNAL USER //
        Client.Authenticate(Users.User2, Users.User2);

        fileInfoResponse = FileInfoManager.GetFileInfo(Client, Data.Files[5].FileId);
        fileInfoResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeFileInfoResponse = FileInfoManager.GetDisputeFileInfos(Client, Data.Dispute.DisputeGuid);
        disputeFileInfoResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        fileInfoPatchResponse = FileInfoManager.UpdateFileInfo(Client, Data.Files[5].FileId, new FileInfoPatchRequest());
        fileInfoPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        fileInfoResponse = FileInfoManager.GetFileInfo(Client, Data.Files[5].FileId);
        fileInfoResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeFileInfoResponse = FileInfoManager.GetDisputeFileInfos(Client, Data.Dispute.DisputeGuid);
        disputeFileInfoResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        fileInfoPatchResponse = FileInfoManager.UpdateFileInfo(Client, Data.Files[5].FileId, new FileInfoPatchRequest());
        fileInfoPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        fileInfoResponse = FileInfoManager.GetFileInfo(Client, Data.Files[5].FileId);
        fileInfoResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        disputeFileInfoResponse = FileInfoManager.GetDisputeFileInfos(Client, Data.Dispute.DisputeGuid);
        disputeFileInfoResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        fileInfoPatchResponse = FileInfoManager.UpdateFileInfo(Client, Data.Files[5].FileId, new FileInfoPatchRequest());
        fileInfoPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}