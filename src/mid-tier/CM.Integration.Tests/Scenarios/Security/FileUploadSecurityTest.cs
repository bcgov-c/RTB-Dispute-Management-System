using System.Net;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckFileUploadSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        var fileResponse = FileUploadManager.PostFile(Client, Data.Dispute.DisputeGuid);
        fileResponse.CheckStatusCode();

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        fileResponse = FileUploadManager.PostFile(Client, Data.Dispute.DisputeGuid);
        fileResponse.CheckStatusCode();

        // LOGIN AS UNAUTHORIZED EXTERNAL USER //
        Client.Authenticate(Users.User2, Users.User2);

        fileResponse = FileUploadManager.PostFile(Client, Data.Dispute.DisputeGuid);
        fileResponse.CheckStatusCode(HttpStatusCode.Unauthorized);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        fileResponse = FileUploadManager.PostFile(Client, Data.Dispute.DisputeGuid);
        fileResponse.CheckStatusCode();

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        fileResponse = FileUploadManager.PostFile(Client, Data.Dispute.DisputeGuid);
        fileResponse.CheckStatusCode();
    }
}