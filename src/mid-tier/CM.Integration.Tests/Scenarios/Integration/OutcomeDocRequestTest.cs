using System;
using System.Collections.Generic;
using System.Net;
using CM.Business.Entities.Models.OutcomeDocRequest;
using CM.Business.Entities.Models.Parties;
using CM.Common.Utilities;
using CM.Integration.Tests.Helpers;
using CM.Integration.Tests.Utils;
using FluentAssertions;
using Xunit;

namespace CM.Integration.Tests.Scenarios.Integration;

public partial class IntegrationTests
{
    [Fact]
    public void CheckRequestWithItems()
    {
        Client.Authenticate(Users.Admin, Users.Admin);

        var dispute = DisputeManager.CreateDispute(Client);
        Client.SetDisputeGuidHeaderToken(dispute.ResponseObject.DisputeGuid);

        var submitterResponse = ParticipantManager.CreateParticipant(Client, dispute.ResponseObject.DisputeGuid, new List<ParticipantRequest>
        {
            new()
            {
                ParticipantType = (byte)ParticipantType.Business,
                ParticipantStatus = (byte)ParticipantStatus.ValidatedAndParticipating,
                FirstName = "IntSched01",
                LastName = "Participant01",
                Address = "P01 Street",
                City = "P01 City",
                ProvinceState = "BC",
                PostalZip = "P1P 1P1",
                Country = "Canada",
                AcceptedTou = true
            }
        });
        submitterResponse.CheckStatusCode();

        var outcomeDocRequestPostResponse1 = OutcomeDocRequestManager
            .CreateOutcomeDocRequest(
                Client,
                dispute.ResponseObject.DisputeGuid,
                new OutcomeDocRequestRequest
                {
                    RequestType = OutcomeDocRequestType.Correction,
                    AffectedDocuments = OutcomeDocAffectedDocuments.DecisionAndMonetaryOrder,
                    AffectedDocumentsText = "Affected Text",
                    RequestDescription = "Request Desc",
                    RequestSubType = OutcomeDocRequestSubType.ToBeDefined,
                    OtherStatusDescription = "Other Status Desc",
                    RequestStatus = 1,
                    DateDocumentsReceived = DateTime.UtcNow.AddDays(-1),
                    SubmitterId = submitterResponse.ResponseObject[0].ParticipantId
                });
        outcomeDocRequestPostResponse1.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        var outcomeDocRequestPostResponse2 = OutcomeDocRequestManager.CreateOutcomeDocRequest(
            Client,
            dispute.ResponseObject.DisputeGuid,
            new OutcomeDocRequestRequest
            {
                RequestType = OutcomeDocRequestType.ReviewRequest,
                AffectedDocuments = OutcomeDocAffectedDocuments.DecisionOnly,
                AffectedDocumentsText = "Affected Text 2",
                RequestDescription = "Request Desc 2",
                RequestSubType = OutcomeDocRequestSubType.ToBeDefined,
                OtherStatusDescription = "Other Status Desc 2",
                RequestStatus = 2,
                DateDocumentsReceived = DateTime.UtcNow.AddDays(-2),
                SubmitterId = submitterResponse.ResponseObject[0].ParticipantId
            });
        outcomeDocRequestPostResponse2.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        var outcomeDocRequestPatchResponse = OutcomeDocRequestManager.UpdateOutcomeDocRequest(
            Client,
            outcomeDocRequestPostResponse1.ResponseObject.OutcomeDocRequestId,
            new OutcomeDocRequestPatchRequest { AffectedDocuments = OutcomeDocAffectedDocuments.MonetaryOrderOnly });
        outcomeDocRequestPatchResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);
        outcomeDocRequestPatchResponse.ResponseObject.AffectedDocuments.Should().Be(OutcomeDocAffectedDocuments.MonetaryOrderOnly);

        // Items Part Creation
        var outcomeDocReqItemPostResponse11 = OutcomeDocReqItemManager.CreateOutcomeDocReqItem(Client, outcomeDocRequestPostResponse1.ResponseObject.OutcomeDocRequestId, new OutcomeDocRequestItemRequest { ItemType = OutcomeDocRequestItemType.Clarification, ItemDescription = "Item Desc 11", ItemNote = "Item Note 11", ItemStatus = 1, ItemSubType = OutcomeDocRequestItemSubType.ToBeDefined, ItemTitle = "Title 11" });
        outcomeDocReqItemPostResponse11.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);
        outcomeDocReqItemPostResponse11.ResponseObject.OutcomeDocRequestId.Should().Be(outcomeDocRequestPostResponse1.ResponseObject.OutcomeDocRequestId);

        var outcomeDocReqItemPostResponse12 = OutcomeDocReqItemManager.CreateOutcomeDocReqItem(Client, outcomeDocRequestPostResponse1.ResponseObject.OutcomeDocRequestId, new OutcomeDocRequestItemRequest { ItemType = OutcomeDocRequestItemType.Clarification, ItemDescription = "Item Desc 12", ItemNote = "Item Note 12", ItemStatus = 1, ItemSubType = OutcomeDocRequestItemSubType.ToBeDefined, ItemTitle = "Title 12" });
        outcomeDocReqItemPostResponse12.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);
        var outcomeDocReqItemPatchResponse12 = OutcomeDocReqItemManager.UpdateOutcomeDocReqItem(Client, outcomeDocReqItemPostResponse12.ResponseObject.OutcomeDocReqItemId, new OutcomeDocRequestItemPatchRequest { ItemDescription = "Updated Description- 12-" + DateTime.UtcNow });
        outcomeDocReqItemPatchResponse12.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

        var outcomeDocReqItemPostResponse21 = OutcomeDocReqItemManager.CreateOutcomeDocReqItem(Client, outcomeDocRequestPostResponse2.ResponseObject.OutcomeDocRequestId, new OutcomeDocRequestItemRequest { ItemType = OutcomeDocRequestItemType.Clarification, ItemDescription = "Item Desc 21", ItemNote = "Item Note 21", ItemStatus = 1, ItemSubType = OutcomeDocRequestItemSubType.ToBeDefined, ItemTitle = "Title 2" });
        outcomeDocReqItemPostResponse21.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);
        outcomeDocReqItemPostResponse21.ResponseObject.OutcomeDocRequestId.Should().Be(outcomeDocRequestPostResponse2.ResponseObject.OutcomeDocRequestId);

        var outcomeDocRequestGetResponse = OutcomeDocRequestManager.GetOutcomeDocRequest(Client, outcomeDocRequestPostResponse1.ResponseObject.OutcomeDocRequestId);
        outcomeDocRequestGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);
        outcomeDocRequestGetResponse.ResponseObject.AffectedDocuments.Should().Be(OutcomeDocAffectedDocuments.MonetaryOrderOnly);
        outcomeDocRequestGetResponse.ResponseObject.OutcomeDocReqItems.Count.Should().Be(2);

        var outcomeDocRequestGetAllResponse = OutcomeDocRequestManager.GetDisputeOutcomeDocRequests(Client, dispute.ResponseObject.DisputeGuid);
        outcomeDocRequestGetAllResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);
        outcomeDocRequestGetAllResponse.ResponseObject.Count.Should().Be(2);
        outcomeDocRequestGetAllResponse.ResponseObject[1].OutcomeDocReqItems.Count.Should().Be(1);

        var outcomeDocRequestDeleteResponse = OutcomeDocRequestManager.DeleteOutcomeDocRequest(Client, outcomeDocRequestPostResponse1.ResponseObject.OutcomeDocRequestId);
        outcomeDocRequestDeleteResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        outcomeDocRequestDeleteResponse = OutcomeDocRequestManager.DeleteOutcomeDocRequest(Client, outcomeDocRequestPostResponse2.ResponseObject.OutcomeDocRequestId);
        outcomeDocRequestDeleteResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var outcomeDocReqItemDeleteResponse = OutcomeDocReqItemManager.DeleteOutcomeDocReqItem(Client, outcomeDocReqItemPostResponse11.ResponseObject.OutcomeDocReqItemId);
        outcomeDocReqItemDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        outcomeDocReqItemDeleteResponse = OutcomeDocReqItemManager.DeleteOutcomeDocReqItem(Client, outcomeDocReqItemPostResponse12.ResponseObject.OutcomeDocReqItemId);
        outcomeDocReqItemDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        outcomeDocRequestDeleteResponse = OutcomeDocRequestManager.DeleteOutcomeDocRequest(Client, outcomeDocRequestPostResponse1.ResponseObject.OutcomeDocRequestId);
        outcomeDocRequestDeleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        outcomeDocRequestGetResponse = OutcomeDocRequestManager.GetOutcomeDocRequest(Client, outcomeDocRequestPostResponse1.ResponseObject.OutcomeDocRequestId);
        outcomeDocRequestGetResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        outcomeDocRequestGetAllResponse = OutcomeDocRequestManager.GetDisputeOutcomeDocRequests(Client, dispute.ResponseObject.DisputeGuid);
        outcomeDocRequestGetAllResponse.ResponseMessage.StatusCode.Should().Be(HttpStatusCode.OK);
        outcomeDocRequestGetAllResponse.ResponseObject.Count.Should().Be(1);
    }
}