using System.Net;
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
    public void CheckOutcomeDocFileSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        var outcomeDocFilePostResponse = OutcomeDocFileManager.CreateOutcomeDocFile(Client, Data.OutcomeDocGroups[0].OutcomeDocGroupId, new OutcomeDocFilePostRequest { DisputeGuid = Data.Dispute.DisputeGuid, FileType = (byte)FileType.ExternalEvidence });
        outcomeDocFilePostResponse.CheckStatusCode();

        var outcomeDocFilePatchResponse = OutcomeDocFileManager.UpdateOutcomeDocFile(Client, Data.OutcomeDocFiles[1].OutcomeDocFileId, new OutcomeDocFilePatchRequest());
        outcomeDocFilePatchResponse.CheckStatusCode();

        var outcomeDocFileDeleteResponse = OutcomeDocFileManager.DeleteOutcomeDocFile(Client, Data.OutcomeDocFiles[5].OutcomeDocFileId);
        outcomeDocFileDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        outcomeDocFilePostResponse = OutcomeDocFileManager.CreateOutcomeDocFile(Client, Data.OutcomeDocGroups[0].OutcomeDocGroupId, new OutcomeDocFilePostRequest { DisputeGuid = Data.Dispute.DisputeGuid, FileType = (byte)FileType.ExternalEvidence });
        outcomeDocFilePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        outcomeDocFilePatchResponse = OutcomeDocFileManager.UpdateOutcomeDocFile(Client, Data.OutcomeDocFiles[1].OutcomeDocFileId, new OutcomeDocFilePatchRequest());
        outcomeDocFilePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        outcomeDocFileDeleteResponse = OutcomeDocFileManager.DeleteOutcomeDocFile(Client, Data.OutcomeDocFiles[5].OutcomeDocFileId);
        outcomeDocFileDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        outcomeDocFilePostResponse = OutcomeDocFileManager.CreateOutcomeDocFile(Client, Data.OutcomeDocGroups[0].OutcomeDocGroupId, new OutcomeDocFilePostRequest { DisputeGuid = Data.Dispute.DisputeGuid, FileType = (byte)FileType.ExternalEvidence });
        outcomeDocFilePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        outcomeDocFilePatchResponse = OutcomeDocFileManager.UpdateOutcomeDocFile(Client, Data.OutcomeDocFiles[1].OutcomeDocFileId, new OutcomeDocFilePatchRequest());
        outcomeDocFilePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        outcomeDocFileDeleteResponse = OutcomeDocFileManager.DeleteOutcomeDocFile(Client, Data.OutcomeDocFiles[5].OutcomeDocFileId);
        outcomeDocFileDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        outcomeDocFilePostResponse = OutcomeDocFileManager.CreateOutcomeDocFile(Client, Data.OutcomeDocGroups[0].OutcomeDocGroupId, new OutcomeDocFilePostRequest { DisputeGuid = Data.Dispute.DisputeGuid, FileType = (byte)FileType.ExternalEvidence });
        outcomeDocFilePostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        outcomeDocFilePatchResponse = OutcomeDocFileManager.UpdateOutcomeDocFile(Client, Data.OutcomeDocFiles[1].OutcomeDocFileId, new OutcomeDocFilePatchRequest());
        outcomeDocFilePatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        outcomeDocFileDeleteResponse = OutcomeDocFileManager.DeleteOutcomeDocFile(Client, Data.OutcomeDocFiles[5].OutcomeDocFileId);
        outcomeDocFileDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}