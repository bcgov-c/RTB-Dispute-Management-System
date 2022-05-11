using System.Net;
using CM.Business.Entities.Models.OutcomeDocument;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Security;

public partial class SecurityTests
{
    [Fact]
    public void CheckOutcomeDocContentSecurity()
    {
        // LOGIN AS STAFF
        Client.Authenticate(Users.Admin, Users.Admin);

        var outcomeDocContentPostResponse = OutcomeDocContentManager.CreateOutcomeDocContent(Client, Data.OutcomeDocFiles[0].OutcomeDocFileId, new OutcomeDocContentPostRequest { ContentType = 1 });
        outcomeDocContentPostResponse.CheckStatusCode();

        var outcomeDocContentPatchResponse = OutcomeDocContentManager.UpdateOutcomeDocContent(Client, Data.OutcomeDocContents[1].OutcomeDocContentId, new OutcomeDocContentPatchRequest());
        outcomeDocContentPatchResponse.CheckStatusCode();

        var outcomeDocContentDeleteResponse = OutcomeDocContentManager.DeleteOutcomeDocContent(Client, Data.OutcomeDocContents[5].OutcomeDocContentId);
        outcomeDocContentDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        // LOGIN AS EXTERNAL
        Client.Authenticate(Users.User, Users.User);

        outcomeDocContentPostResponse = OutcomeDocContentManager.CreateOutcomeDocContent(Client, Data.OutcomeDocFiles[0].OutcomeDocFileId, new OutcomeDocContentPostRequest { ContentType = 1 });
        outcomeDocContentPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        outcomeDocContentPatchResponse = OutcomeDocContentManager.UpdateOutcomeDocContent(Client, Data.OutcomeDocContents[1].OutcomeDocContentId, new OutcomeDocContentPatchRequest());
        outcomeDocContentPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        outcomeDocContentDeleteResponse = OutcomeDocContentManager.DeleteOutcomeDocContent(Client, Data.OutcomeDocContents[5].OutcomeDocContentId);
        outcomeDocContentDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS ACCESSCODE
        var auth = Client.Authenticate(Data.Participant.AccessCode);
        Assert.True(auth.ResponseObject is string);

        outcomeDocContentPostResponse = OutcomeDocContentManager.CreateOutcomeDocContent(Client, Data.OutcomeDocFiles[0].OutcomeDocFileId, new OutcomeDocContentPostRequest { ContentType = 1 });
        outcomeDocContentPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        outcomeDocContentPatchResponse = OutcomeDocContentManager.UpdateOutcomeDocContent(Client, Data.OutcomeDocContents[1].OutcomeDocContentId, new OutcomeDocContentPatchRequest());
        outcomeDocContentPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        outcomeDocContentDeleteResponse = OutcomeDocContentManager.DeleteOutcomeDocContent(Client, Data.OutcomeDocContents[5].OutcomeDocContentId);
        outcomeDocContentDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // LOGIN AS OFFICE PAY
        Client.Authenticate(Users.RemoteOffice, Users.RemoteOffice);

        outcomeDocContentPostResponse = OutcomeDocContentManager.CreateOutcomeDocContent(Client, Data.OutcomeDocFiles[0].OutcomeDocFileId, new OutcomeDocContentPostRequest { ContentType = 1 });
        outcomeDocContentPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        outcomeDocContentPatchResponse = OutcomeDocContentManager.UpdateOutcomeDocContent(Client, Data.OutcomeDocContents[1].OutcomeDocContentId, new OutcomeDocContentPatchRequest());
        outcomeDocContentPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        outcomeDocContentDeleteResponse = OutcomeDocContentManager.DeleteOutcomeDocContent(Client, Data.OutcomeDocContents[5].OutcomeDocContentId);
        outcomeDocContentDeleteResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}