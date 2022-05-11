using System;
using System.Net;
using CM.Business.Entities.Models.OutcomeDocRequest;
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
    [InlineData(Users.RemoteOffice, Users.RemoteOffice, HttpStatusCode.Unauthorized)]
    [InlineData(null, null, HttpStatusCode.Unauthorized)]
    public void CheckOutcomeDocReqItemSecurity(string userName, string password, HttpStatusCode httpStatusCode)
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

        var outcomeDocReqItemPostResponse = OutcomeDocReqItemManager.CreateOutcomeDocReqItem(Client, Data.OutcomeDocRequests[3].OutcomeDocRequestId, new OutcomeDocRequestItemRequest { ItemType = Common.Utilities.OutcomeDocRequestItemType.Clarification });
        outcomeDocReqItemPostResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        var outcomeDocReqItemPatchResponse = OutcomeDocReqItemManager.UpdateOutcomeDocReqItem(Client, Data.OutcomeDocReqItems[1].OutcomeDocReqItemId, new OutcomeDocRequestItemPatchRequest { ItemDescription = "Updated Description-" + DateTime.UtcNow });
        outcomeDocReqItemPatchResponse.ResponseMessage.StatusCode.Should().Be(httpStatusCode);

        var outcomeDocReqItemDeleteResponse = OutcomeDocReqItemManager.DeleteOutcomeDocReqItem(Client, Data.OutcomeDocReqItems[5].OutcomeDocReqItemId);
        outcomeDocReqItemDeleteResponse.StatusCode.Should().Be(httpStatusCode);
    }
}